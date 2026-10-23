import { createClient } from "@supabase/supabase-js";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callMultimodalVision } from "@/lib/vision-engine";
import { comparePrescriptionPrices } from "@/lib/medicine-catalog";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function getDocumentEncryptionKey(): Buffer {
  const configured = process.env.MEDICAL_DOCUMENT_ENCRYPTION_KEY?.trim() || "";
  const key = /^[0-9a-f]{64}$/i.test(configured)
    ? Buffer.from(configured, "hex")
    : Buffer.from(configured, "base64");
  if (key.length !== 32) throw new Error("MEDICAL_DOCUMENT_ENCRYPTION_KEY must decode to 32 bytes.");
  return key;
}

function encryptDocumentBytes(value: Buffer): Buffer {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getDocumentEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]);
}

export function decryptDocumentText(value: string): string {
  const packed = Buffer.from(value, "base64");
  if (packed.length < 29) throw new Error("Encrypted medical document data is invalid.");
  const iv = packed.subarray(0, 12);
  const authTag = packed.subarray(12, 28);
  const encrypted = packed.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", getDocumentEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function getVerifiedUserId(request: Request): Promise<string | null> {
  const token = request.headers.get("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !supabaseUrl || !anonKey) return null;

  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  return error ? null : data.user?.id ?? null;
}

function hasValidImageSignature(mimeType: string, bytes: Buffer): boolean {
  if (mimeType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimeType === "image/webp") return bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP";
  return false;
}

function safeFileName(name: string): string {
  const normalized = name.replace(/[\\/\0-\x1f]/g, "_").trim().slice(0, 255);
  return normalized || "medical-image";
}

function parsePrescription(text: string): unknown {
  const block = text.match(/```json:prescription_analysis\s*([\s\S]*?)```/i)?.[1]
    ?? text.match(/```json\s*([\s\S]*?)```/i)?.[1];
  if (!block) return null;
  try {
    return JSON.parse(block.trim());
  } catch {
    return null;
  }
}

export async function analyzeAndStoreMedicalImage(
  request: Request,
  kind: "prescription" | "report",
  systemPrompt: string,
) {
  const userId = await getVerifiedUserId(request);
  if (!userId) return jsonError("Sign in with a verified account before uploading medical documents.", 401);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_IMAGE_BYTES + 64 * 1024) return jsonError("Image must be 8 MB or smaller.", 413);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("A valid multipart image upload is required.", 400);
  }

  if (formData.get("consent") !== "true") return jsonError("Consent to AI processing and secure record storage is required.", 400);

  const file = formData.get("image");
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return jsonError("No image file was provided.", 400);
  }
  if (file.size < 1 || file.size > MAX_IMAGE_BYTES) return jsonError("Image must be between 1 byte and 8 MB.", 413);
  if (!ALLOWED_MIME_TYPES.has(file.type)) return jsonError("Use a JPEG, PNG, or WebP image.", 415);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (!hasValidImageSignature(file.type, buffer)) return jsonError("The uploaded file does not match its declared image type.", 415);

  const userPrompt = String(formData.get("prompt") || "").trim().slice(0, 1000);
  try {
    getDocumentEncryptionKey();
    const result = await callMultimodalVision(buffer, file.type, systemPrompt, userPrompt);
    const parsedPrescription = kind === "prescription" ? parsePrescription(result.rawText) : null;
    const comparisons = parsedPrescription ? comparePrescriptionPrices(parsedPrescription) : null;
    const saved = await prisma.medicalDocument.create({
      data: {
        ownerId: userId,
        kind,
        originalName: safeFileName(file.name),
        mimeType: file.type,
        provider: result.provider,
        category: result.imageCategory,
        analysis: encryptDocumentBytes(Buffer.from(result.rawText, "utf8")).toString("base64"),
        priceComparison: comparisons ? encryptDocumentBytes(Buffer.from(JSON.stringify(comparisons.matches), "utf8")).toString("base64") : null,
        priceSnapshot: comparisons ? JSON.stringify(comparisons.snapshot) : null,
        image: encryptDocumentBytes(buffer),
        consentAt: new Date(),
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({
      documentId: saved.id,
      createdAt: saved.createdAt.toISOString(),
      analysis: result.rawText,
      category: result.imageCategory,
      provider: result.provider,
      priceSnapshot: comparisons?.snapshot,
      medicineComparisons: comparisons?.matches,
    });
  } catch (error) {
    console.error(`[Medical document] ${kind} analysis or storage failed:`, error);
    return jsonError("Analysis could not be completed or securely saved. Please try again later.", 503);
  }
}

export function getMedicalDocumentUserId(request: Request) {
  return getVerifiedUserId(request);
}
