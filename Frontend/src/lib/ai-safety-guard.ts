import { prisma, withDbTimeout } from "@/lib/prisma";
import { detectEmergency } from "@/lib/ai/emergency-detector";

export const MANDATORY_BENGALI_DISCLAIMER =
  "এটি AI-এর প্রাথমিক বিশ্লেষণ — চূড়ান্ত diagnosis নয়। Registered doctor-এর পরামর্শ নিন।";

export const SHARED_CLINICAL_PROMPT_GUARDRAILS = `
STRICT CLINICAL SAFETY GUARDRAILS:
1. You are an assistive Bengali health educator — NEVER give a definitive medical diagnosis.
2. Always use probabilistic Bengali phrasing such as "সম্ভাব্য", "ধারণা করা যায়", and "ডাক্তারের সাথে মিলিয়ে দেখুন".
3. NEVER write phrases like "আপনার রোগ X হয়েছে" or "You have disease X".
4. NEVER invent unmeasured accuracy percentages (e.g., "99% accurate").
5. Highlight red-flag emergencies first with 999 / nearest hospital instruction.
6. End every response with: "${MANDATORY_BENGALI_DISCLAIMER}"
`.trim();

export interface RedFlagInput {
  text?: string;
  symptoms?: string[];
  parameters?: Array<{ code: string; value: number; unit?: string }>;
}

export interface RedFlagResult {
  isEmergency: boolean;
  bannerTitleBn: string;
  emergencyInstructionBn: string;
  triggers: string[];
  callNumber: "999";
}

export interface FlaggedAiOutputRecord {
  id: string;
  sourceModule: string;
  violations: string[];
  originalSnippet: string;
  sanitizedSnippet: string;
  createdAt: string;
}

const g = globalThis as typeof globalThis & {
  __oxpeckerSafetyLogs?: FlaggedAiOutputRecord[];
};

function getSafetyLogStore(): FlaggedAiOutputRecord[] {
  if (!g.__oxpeckerSafetyLogs) {
    g.__oxpeckerSafetyLogs = [];
  }
  return g.__oxpeckerSafetyLogs;
}

export function getFlaggedAiOutputs(): FlaggedAiOutputRecord[] {
  return [...getSafetyLogStore()];
}

export function checkRedFlagOverride(input: RedFlagInput): RedFlagResult {
  const triggers: string[] = [];
  const combinedText = [input.text || "", ...(input.symptoms || [])]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (combinedText) {
    const emergency = detectEmergency(combinedText);
    if (emergency?.isEmergency) {
      triggers.push(emergency.condition);
    }

    const extraCriticalPatterns: Array<[RegExp, string]> = [
      [/intracranial\s+(hemorrhage|bleed)|subarachnoid|midline\s+shift/i, "গুরুতর মস্তিষ্ক/রক্তক্ষরণ সতর্কতা"],
      [/pneumothorax|pulmonary\s+embolism|aortic\s+dissection/i, "জরুরি হৃদয়/ফুসফুস সতর্কতা"],
      [/acute\s+infarct|acute\s+ischemi/i, "সম্ভাব্য জরুরি স্ট্রোক/ইস্কেমিয়া সংকেত"],
      [/তীব্র\s+শ্বাসকষ্ট|অজ্ঞান|মুখ\s+বেঁকে|বুকে\s+তীব্র\s+ব্যথা|প্রচণ্ড\s+রক্তপাত/i, "গুরুতর জরুরি শারীরিক উপসর্গ"],
    ];

    for (const [regex, label] of extraCriticalPatterns) {
      if (regex.test(combinedText) && !triggers.includes(label)) {
        triggers.push(label);
      }
    }
  }

  for (const param of input.parameters || []) {
    if (!Number.isFinite(param.value)) continue;
    const code = param.code.toLowerCase();
    const unit = (param.unit || "").toLowerCase();
    const val = param.value;

    if (code === "hb" && (val < 7.0 || val > 20.0)) {
      triggers.push(`অতি জরুরি Hemoglobin (${val} ${param.unit || "g/dL"})`);
    } else if (code === "fbs" || code === "rbs" || code === "glucose") {
      const mgVal = unit.includes("mmol") ? val * 18.0182 : val;
      if (mgVal < 54 || mgVal > 400) {
        triggers.push(`জরুরি রক্তের সুগার মাত্রা (${val} ${param.unit || "mg/dL"})`);
      }
    } else if (code === "platelets" && val < 50000) {
      triggers.push(`অত্যন্ত কম Platelet (${val.toLocaleString("en-US")})`);
    } else if (code === "creatinine" && val > 4.0) {
      triggers.push(`উচ্চ Creatinine সতর্কতা (${val} mg/dL)`);
    } else if (code === "tsh" && val > 50) {
      triggers.push(`অত্যধিক উচ্চ TSH সতর্কতা (${val} mIU/L)`);
    } else if (code === "bilirubin" && val > 10) {
      triggers.push(`উচ্চ Bilirubin সতর্কতা (${val} mg/dL)`);
    }
  }

  const isEmergency = triggers.length > 0;
  return {
    isEmergency,
    bannerTitleBn: isEmergency
      ? "জরুরি সতর্কতা: এখনই নিকটস্থ হাসপাতালের জরুরি বিভাগে (ER) যান বা ৯৯৯-এ কল করুন"
      : "",
    emergencyInstructionBn: isEmergency
      ? `বিপদসংকেত শনাক্ত হয়েছে (${triggers.join(", ")})। কোনো অনলাইন রিপোর্ট বিশ্লেষণের জন্য অপেক্ষা না করে অবিলম্বে নিকটতম জরুরি বিভাগে যান অথবা ৯৯৯-এ কল করুন।`
      : "",
    triggers,
    callNumber: "999",
  };
}

export function validateAndSanitizeAiOutput(
  text: string,
  sourceModule = "report_analyzer",
  organizationId = "org-default"
): {
  sanitizedText: string;
  flagged: boolean;
  violations: string[];
} {
  let sanitized = String(text || "").trim();
  const violations: string[] = [];

  const diagnosticRules: Array<{ regex: RegExp; reason: string; replacement: string }> = [
    {
      regex: /আপনার\s+([^\n.,!?]{1,40}?\s+)?(রোগ|ডায়াবেটিস|ক্যান্সার|টিউমার|কিডনি\s+রোগ|লিভার\s+রোগ|হৃদরোগ|অ্যানিমিয়া)\s+(হয়েছে|আছে)/gi,
      reason: "Prohibited definitive Bengali diagnosis phrase",
      replacement: "সম্ভাব্য লক্ষণ বা পরিবর্তন দেখা যাচ্ছে (ডাক্তারের সাথে মিলিয়ে দেখুন)",
    },
    {
      regex: /\byou\s+(definitely\s+)?have\s+(diabetes|cancer|kidney\s+failure|heart\s+disease|anemia|hepatitis)\b/gi,
      reason: "Prohibited definitive English diagnosis phrase",
      replacement: "possible clinical variation noted — please correlate with a physician",
    },
    {
      regex: /চূড়ান্ত\s+(ডায়াগনসিস|রোগ\s*নির্ণয়)\s*[:\-]/gi,
      reason: "Claimed definitive diagnosis",
      replacement: "সম্ভাব্য প্রাথমিক মূল্যায়ন (ডাক্তারের সাথে মিলিয়ে দেখুন):",
    },
    {
      regex: /\b\d{1,3}(?:\.\d+)?%\s*(?:accuracy|accurate|precision|নির্ভুল(?:তা)?|সঠিক)\b/gi,
      reason: "Unmeasured accuracy percentage claim",
      replacement: "প্রাথমিক তথ্যভিত্তিক নির্দেশনা",
    },
  ];

  for (const rule of diagnosticRules) {
    if (rule.regex.test(sanitized)) {
      violations.push(rule.reason);
      sanitized = sanitized.replace(rule.regex, rule.replacement);
    }
  }

  if (!sanitized.includes(MANDATORY_BENGALI_DISCLAIMER)) {
    sanitized = sanitized
      ? `${sanitized}\n\n${MANDATORY_BENGALI_DISCLAIMER}`
      : MANDATORY_BENGALI_DISCLAIMER;
  }

  const flagged = violations.length > 0;
  if (flagged) {
    const id = `safety-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record: FlaggedAiOutputRecord = {
      id,
      sourceModule,
      violations,
      originalSnippet: String(text || "").slice(0, 400),
      sanitizedSnippet: sanitized.slice(0, 400),
      createdAt: new Date().toISOString(),
    };
    const store = getSafetyLogStore();
    store.unshift(record);
    if (store.length > 100) store.pop();

    if (process.env.DATABASE_URL) {
      void withDbTimeout(
        prisma.auditLog.create({
          data: {
            actorId: "ai-safety-guard",
            actorName: "Oxpecker AI Safety Validator",
            actorRole: "system",
            organizationId,
            action: "AI_SAFETY_FLAGGED",
            targetType: sourceModule,
            targetId: id,
            reason: violations.join("; "),
            metadata: {
              violations,
              originalSnippet: record.originalSnippet,
            } as any,
          },
        }),
        800
      ).catch(() => {});
    }
  }

  return { sanitizedText: sanitized, flagged, violations };
}
