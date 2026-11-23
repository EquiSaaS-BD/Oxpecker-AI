/**
 * Prescription AI Price Summary (database-verified, LLM-narrated)
 *
 * After a prescription image is transcribed and all medicines are matched
 * against the verified Bangladesh medicine database (medicine-catalog +
 * prescription-intelligence), this module composes the final AI answer that
 * the user actually reads: per-medicine verified unit price, line totals,
 * cheaper generic alternatives, and total savings.
 *
 * SAFETY RULES (non-negotiable):
 *  1. The LLM receives ONLY the verified database payload below. It is
 *     instructed to treat that payload as the single source of truth and to
 *     output "price not found in database" for anything missing — never
 *     invent brands, prices, pak sizes or savings.
 *  2. If the LLM call fails, a fixed honest bilingual notice is returned —
 *     no fabricated summary is ever produced by locally-generated text.
 *  3. Responses always carry the "AI informs, never replaces a doctor or
 *     pharmacist" framing and a price-verification disclaimer.
 */

import { AzureOpenAIProvider } from "@/lib/ai/providers/azure";
import { OpenAIProvider } from "@/lib/ai/providers/openai";
import type { PrescriptionIntelligenceResult } from "@/lib/prescription-intelligence";

export interface PrescriptionAiAiSummary {
  summary: string | null;
  provider: string;
  model: string;
  error?: string;
}

interface AiSummaryPayloadItem {
  prescribedName: string | null;
  strength: string | null;
  dosageForm: string | null;
  frequency: string | null;
  duration: string | null;
  quantity: number | null;
  matchStatus: string;
  matchConfidence: number | null;
  databaseMatch: {
    brandName: string;
    genericName: string;
    strength: string;
    dosageForm: string;
    manufacturer: string;
    unitPriceBdt: number | null;
    packPriceBdt: number | null;
    packSizeDescription: string | null;
    priceSource: string;
  } | null;
  pricing: {
    pricingStatus: string;
    statusMessage: string;
    requiredQuantity: number | null;
    unitPriceBdt: number | null;
    lineTotalBdt: number | null;
  } | null;
  cheaperAlternatives: Array<{
    brandName: string;
    genericName: string;
    strength: string;
    dosageForm: string;
    manufacturer: string;
    unitPriceBdt: number | null;
    packPriceBdt: number | null;
    savingsPerUnitBdt: number | null;
  }>;
}

interface AiSummaryPayload {
  verifiedDatabase: {
    source: string;
    currency: string;
  };
  totals: {
    verifiedTotalBdt: number | null;
    estimatedTotalBdt: number | null;
    isCompleteCalculation: boolean;
    pricedMedicinesCount: number;
    unpricedMedicinesCount: number;
    matchedCount: number;
    totalExtractedCount: number;
    unpricedItems: Array<{ extractedName: string; reason: string }>;
  } | null;
  items: AiSummaryPayloadItem[];
}

const MAX_ITEMS = 30;
const MAX_ALTERNATIVES_PER_ITEM = 3;

function round2(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}

function buildVerifiedPayload(
  intelligence: PrescriptionIntelligenceResult,
  sourceLabel: string
): AiSummaryPayload {
  const rawItems = Array.isArray(intelligence.items) ? intelligence.items : [];

  const items: AiSummaryPayloadItem[] = rawItems.slice(0, MAX_ITEMS).map((item: any) => {
    const m = item.matchedMedicine || null;
    const pricing = item.pricing || null;
    const alts = Array.isArray(item.genericAlternatives) ? item.genericAlternatives : [];

    return {
      prescribedName: item.extracted?.brandName || null,
      strength: item.extracted?.strength || null,
      dosageForm: item.extracted?.dosageForm || null,
      frequency: item.extracted?.frequency || null,
      duration: item.extracted?.duration || null,
      quantity: pricing?.requiredQuantity ?? null,
      matchStatus: item.matchStatus || "unknown",
      matchConfidence: typeof item.matchConfidence === "number" ? item.matchConfidence : null,
      databaseMatch: m
        ? {
            brandName: m.brandName,
            genericName: m.genericName,
            strength: m.strength,
            dosageForm: m.dosageForm,
            manufacturer: m.manufacturer,
            unitPriceBdt: round2(m.unitPrice),
            packPriceBdt: round2(m.packPrice),
            packSizeDescription: m.packSizeDescription ?? null,
            priceSource: m.priceSource || "verified catalog",
          }
        : null,
      pricing: pricing
        ? {
            pricingStatus: pricing.pricingStatus,
            statusMessage: pricing.statusMessage,
            requiredQuantity: pricing.requiredQuantity,
            unitPriceBdt: round2(pricing.unitPriceBdt),
            lineTotalBdt: round2(pricing.lineTotalBdt),
          }
        : null,
      cheaperAlternatives: alts.slice(0, MAX_ALTERNATIVES_PER_ITEM).map((alt: any) => ({
        brandName: alt.brandName,
        genericName: alt.genericName,
        strength: alt.strength,
        dosageForm: alt.dosageForm,
        manufacturer: alt.manufacturer,
        unitPriceBdt: round2(alt.unitPrice),
        packPriceBdt: round2(alt.packPrice),
        savingsPerUnitBdt: round2(alt.savingsPerUnitBdt),
      })),
    };
  });

  const s = intelligence.summary || null;

  return {
    verifiedDatabase: {
      source: sourceLabel || "Oxpecker verified medicine database (MedEx Bangladesh catalog snapshot)",
      currency: "BDT (৳)",
    },
    totals: s
      ? {
          verifiedTotalBdt: round2(s.verifiedTotalBdt),
          estimatedTotalBdt: round2(s.estimatedTotalBdt),
          isCompleteCalculation: Boolean(s.isCompleteCalculation),
          pricedMedicinesCount: s.pricedMedicinesCount ?? 0,
          unpricedMedicinesCount: s.unpricedMedicinesCount ?? 0,
          matchedCount: s.matchedCount ?? 0,
          totalExtractedCount: s.totalExtractedCount ?? 0,
          unpricedItems: (Array.isArray(s.unpricedItems) ? s.unpricedItems : [])
            .slice(0, 20)
            .map((u: any) => ({ extractedName: u.extractedName, reason: u.reason })),
        }
      : null,
    items,
  };
}

function buildSystemPrompt(): string {
  return `You are Oxpecker AI, a responsible medical-cost assistant for patients in Bangladesh.

You will receive ONE message titled "VERIFIED DATABASE PAYLOAD". It contains prescription medicines that were transcribed from a real prescription image and then verified against Oxpecker's medicine database. Every price, brand, and saving figure in that payload comes from the verified database — it is the SINGLE SOURCE OF TRUTH.

ABSOLUTE RULES (violating any of these makes the answer invalid):
1. ONLY use numbers, medicine names, manufacturers, and statuses present in the payload. Adding ANY price, brand name, savings figure, or medicine that is not in the payload is strictly forbidden.
2. If a price or field is null or missing in the payload, say "দাম ডেটাবেসে পাওয়া যায়নি / price not found in database" for that item. Never guess, estimate, or fill gaps yourself.
3. NEVER invent, complete, or change: medicine names, strengths, doses, frequencies, or durations. If a transcription field is null, simply state it was not clearly readable.
4. NEVER give medical advice: do not confirm, criticize, or suggest changes to the doctor's prescription, doses, or therapy. Medicine choices and therapy belong ONLY to the prescribing doctor.
5. Never claim the AI's price is the final price. Always note pharmacy prices may differ slightly and should be confirmed at the pharmacy.
6. Write in simple, warm Bangla AND English (both, clearly separated).
7. If generic alternatives are provided in the payload, present them ONLY as informational options to discuss with the pharmacist/doctor ("বিকল্প হিসেবে ফার্মেসিস্টের সাথে আলোচনা করতে পারেন"), with the exact savings figure from the payload.
8. End with a short safety note that Oxpecker AI informs but never replaces a doctor's or pharmacist's judgment.

OUTPUT FORMAT (plain text, no markdown headings, short sections):
- English section first, then "বাংলা" section.
- For each medicine: prescribed name — matched database name (if any) — verified unit price — quantity (if known) — line total. Mark anything the database could not price honestly.
- Then "Estimated total cost" (use only payload totals; say clearly if the calculation is partial).
- Then "Possible savings" listing cheaper generic alternatives exactly as provided, or stating none were found in the database.
- Keep it under 350 words total.`;
}

function buildUserMessage(payload: AiSummaryPayload): string {
  return ["VERIFIED DATABASE PAYLOAD:", JSON.stringify(payload, null, 1)].join("\n");
}

const HONEST_UNAVAILABLE_NOTICE =
  "AI মূল্য-সারসংক্ষেপ এখন তৈরি করা সম্ভব হয়নি। নিচের ভেরিফায়েড টেবিলে ডেটাবেস থেকে মিলানো দাম ও বিকল্প দেখানো আছে — সেটিই ব্যবহার করুন। / The AI price summary could not be generated right now. Please use the verified price table below, which already shows database-matched prices and alternatives.";

const HONEST_NOTHING_READABLE_NOTICE =
  "এই প্রেসক্রিপশন থেকে কোনো ওষুধ নির্ভরযোগ্যভাবে পড়া যায়নি, তাই দাম যাচাই করা সম্ভব নয়। স্পষ্ট ছবি আপলোড করুন বা ওষুধগুলো হাতে যুক্ত করুন। / No medicines could be reliably read from this prescription, so prices cannot be verified. Please upload a clearer image or add the medicines manually.";

function createProvider(): { provider: AzureOpenAIProvider | OpenAIProvider; label: string } {
  const openAiKey = (process.env.OPENAI_API_KEY || "").trim();
  if (openAiKey) {
    return {
      provider: new OpenAIProvider({
        apiKey: openAiKey,
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.1,
        timeout: 30_000,
        maxTokens: 3000,
      }),
      label: "openai",
    };
  }
  return {
    provider: new AzureOpenAIProvider({
      apiKey: process.env.AZURE_OPENAI_API_KEY || "",
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || "",
      deployment: process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-5-mini",
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview",
      temperature: 0.1,
      timeout: 30_000,
      maxTokens: 3000,
    }),
    label: "azure-openai",
  };
}

/**
 * Generate the user-facing AI cost summary using ONLY database-verified data.
 * Returns an honest notice instead of a summary whenever generation is not
 * possible — this function can never produce fabricated figures.
 */
export async function generatePrescriptionAiSummary(
  intelligence: PrescriptionIntelligenceResult | null,
  sourceLabel: string
): Promise<PrescriptionAiAiSummary> {
  // Nothing readable → deterministic honest notice, no LLM call needed.
  if (!intelligence || !Array.isArray(intelligence.items) || intelligence.items.length === 0) {
    return { summary: null, provider: "oxpecker-guard", model: "none", error: HONEST_NOTHING_READABLE_NOTICE };
  }

  const { provider, label } = createProvider();
  if (label === "azure-openai" && !(process.env.AZURE_OPENAI_API_KEY || "").trim()) {
    return { summary: null, provider: label, model: "none", error: HONEST_UNAVAILABLE_NOTICE };
  }

  const payload = buildVerifiedPayload(intelligence, sourceLabel);

  try {
    const res = await provider.chat([
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserMessage(payload) },
    ]);
    const summary = (res.content || "").trim().slice(0, 4000);
    if (!summary) {
      return { summary: null, provider: label, model: res.model, error: HONEST_UNAVAILABLE_NOTICE };
    }
    return { summary, provider: label, model: res.model };
  } catch {
    return {
      summary: null,
      provider: label,
      model: "none",
      error: HONEST_UNAVAILABLE_NOTICE,
    };
  }
}
