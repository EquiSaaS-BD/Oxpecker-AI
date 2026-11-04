import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import {
  decryptDocumentText,
  encryptDocumentBytes,
  getMedicalDocumentUserId,
} from "@/lib/medical-document-server";
import {
  buildPrescriptionIntelligence,
  extractStructuredMedicinesFromRawOcrText,
} from "@/lib/prescription-intelligence";
import { parsePrescriptionTranscription } from "@/lib/prescription-ocr";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const ownerId = await getMedicalDocumentUserId(request);
    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized request." }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Valid JSON payload is required." }, { status: 400 });
    }

    const prescriptionId =
      typeof body.prescriptionId === "string" && body.prescriptionId.trim()
        ? body.prescriptionId.trim().slice(0, 191)
        : `rx-${Date.now()}`;

    let rawMedicines: any[] = [];
    if (Array.isArray(body.medicines)) {
      rawMedicines = body.medicines;
    } else if (Array.isArray(body.items)) {
      rawMedicines = body.items.map((item: any) => item.extracted || item);
    } else if (typeof body.rawText === "string" && body.rawText.trim()) {
      rawMedicines = extractStructuredMedicinesFromRawOcrText(body.rawText.trim());
    }

    if (rawMedicines.length > 40) {
      return NextResponse.json(
        { error: "A prescription cannot exceed 40 medicine entries." },
        { status: 400 }
      );
    }

    const intelligence = buildPrescriptionIntelligence({
      prescriptionId,
      createdAt: typeof body.createdAt === "string" ? body.createdAt : undefined,
      rawMedicines,
      imageQuality: body.imageQuality,
      metadata: body.metadata || body.prescriptionMetadata,
      rawOcrText: typeof body.rawText === "string" ? body.rawText : body.rawOcrText || null,
      provider: body.provider || "Oxpecker-Prescription-Intelligence-Engine",
    });

    // Persist update if saveToHistory is requested or document exists in database
    if (body.saveToHistory !== false && prescriptionId && !prescriptionId.startsWith("temp-")) {
      const existing = await withDbTimeout(
        prisma.medicalDocument.findUnique({
          where: { id: prescriptionId },
          select: { id: true, ownerId: true },
        }),
        1800
      ).catch(() => null);

      if (existing) {
        if (existing.ownerId !== ownerId) {
          return NextResponse.json(
            { error: "Forbidden: You do not own this prescription record." },
            { status: 403 }
          );
        }
        const transcriptionPayload = {
          imageQuality: intelligence.imageQuality,
          prescriptionDate: intelligence.prescriptionMetadata.prescriptionDate,
          patientName: intelligence.prescriptionMetadata.patientName,
          doctorName: intelligence.prescriptionMetadata.doctorName,
          medicines: intelligence.items.map((it) => ({
            id: it.extracted.id,
            brandName: it.extracted.brandName,
            genericName: it.extracted.genericName,
            strength: it.extracted.strength,
            dosageForm: it.extracted.dosageForm,
            manufacturer: it.extracted.manufacturer,
            frequency: it.extracted.frequency,
            duration: it.extracted.duration,
            quantity: it.extracted.quantity,
            instructionsTranscribed: it.extracted.dosageInstructions,
            selectedDatabaseMedicineId: it.extracted.selectedDatabaseMedicineId || it.matchedMedicine?.id || null,
            confidence: it.extracted.ocrConfidence >= 0.8 ? "clear" : "uncertain",
          })),
          uncertainFields: [],
          rawOcrText: intelligence.rawOcrText,
          manualReviewRequired: true,
          userReview: { verifiedAgainstImage: true, reviewedAt: new Date().toISOString() },
        };
        const analysisText = `\`\`\`json:prescription_analysis\n${JSON.stringify(transcriptionPayload, null, 2)}\n\`\`\``;
        await withDbTimeout(
          prisma.medicalDocument.update({
            where: { id: existing.id },
            data: {
              analysis: encryptDocumentBytes(Buffer.from(analysisText, "utf8")).toString("base64"),
              priceComparison: encryptDocumentBytes(
                Buffer.from(JSON.stringify({ intelligence }), "utf8")
              ).toString("base64"),
            },
          }),
          2000
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      intelligence,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to process prescription intelligence calculation." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const ownerId = await getMedicalDocumentUserId(request);
    if (!ownerId) {
      return NextResponse.json({ error: "Sign in to view saved prescriptions." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const doc = await withDbTimeout(
        prisma.medicalDocument.findUnique({
          where: { id },
          select: {
            id: true,
            ownerId: true,
            kind: true,
            originalName: true,
            mimeType: true,
            provider: true,
            analysis: true,
            priceComparison: true,
            createdAt: true,
          },
        }),
        2500
      ).catch(() => null);

      if (!doc) {
        return NextResponse.json({ error: "Prescription record not found." }, { status: 404 });
      }
      if (doc.ownerId !== ownerId) {
        return NextResponse.json({ error: "Forbidden: Access denied." }, { status: 403 });
      }

      const decryptedAnalysis = decryptDocumentText(doc.analysis);
      let intelligence = null;
      if (doc.priceComparison) {
        try {
          const parsedComp = JSON.parse(decryptDocumentText(doc.priceComparison));
          intelligence = parsedComp.intelligence || null;
        } catch {}
      }

      if (!intelligence) {
        const parsed = parsePrescriptionTranscription(decryptedAnalysis);
        intelligence = buildPrescriptionIntelligence({
          prescriptionId: doc.id,
          createdAt: doc.createdAt.toISOString(),
          rawMedicines: parsed?.medicines || [],
          imageQuality: parsed?.imageQuality,
          metadata: {
            patientName: parsed?.patientName,
            doctorName: parsed?.doctorName,
            prescriptionDate: parsed?.prescriptionDate,
          },
          rawOcrText: parsed?.rawOcrText || null,
          provider: doc.provider,
        });
      }

      return NextResponse.json({
        documentId: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        createdAt: doc.createdAt.toISOString(),
        intelligence,
      });
    }

    // List recent prescription analyses for this user
    const docs = await withDbTimeout(
      prisma.medicalDocument.findMany({
        where: { ownerId, kind: "prescription" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          provider: true,
          analysis: true,
          priceComparison: true,
          createdAt: true,
        },
      }),
      2500
    ).catch(() => []);

    const history = docs.map((doc) => {
      let intelligence = null;
      try {
        if (doc.priceComparison) {
          const parsedComp = JSON.parse(decryptDocumentText(doc.priceComparison));
          intelligence = parsedComp.intelligence || null;
        }
        if (!intelligence) {
          const decryptedAnalysis = decryptDocumentText(doc.analysis);
          const parsed = parsePrescriptionTranscription(decryptedAnalysis);
          intelligence = buildPrescriptionIntelligence({
            prescriptionId: doc.id,
            createdAt: doc.createdAt.toISOString(),
            rawMedicines: parsed?.medicines || [],
            imageQuality: parsed?.imageQuality,
            metadata: {
              patientName: parsed?.patientName,
              doctorName: parsed?.doctorName,
              prescriptionDate: parsed?.prescriptionDate,
            },
            rawOcrText: parsed?.rawOcrText || null,
            provider: doc.provider,
          });
        }
      } catch {}
      return {
        documentId: doc.id,
        originalName: doc.originalName,
        mimeType: doc.mimeType,
        provider: doc.provider,
        createdAt: doc.createdAt.toISOString(),
        intelligence,
      };
    });

    return NextResponse.json({ history });
  } catch {
    return NextResponse.json({ error: "Failed to retrieve prescription history." }, { status: 500 });
  }
}
