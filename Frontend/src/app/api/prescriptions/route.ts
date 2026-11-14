import { NextResponse } from 'next/server';
import { prisma, withDbTimeout } from '@/lib/prisma';
import { requireSessionUser } from '@/lib/server-auth';

export async function POST(req: Request) {
  const auth = await requireSessionUser(req, ["doctor", "hospital", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const data = await req.json();
    const { patientId: mrn, patientName, ...prescriptionData } = data;

    if (!mrn) {
      return NextResponse.json({ error: "Patient ID (MRN) is required" }, { status: 400 });
    }

    const orgId = user.organizationId || "org-default";

    const patient = await withDbTimeout(
      prisma.patient.upsert({
        where: { mrn: String(mrn).trim() },
        update: { name: patientName || undefined, organizationId: orgId },
        create: {
          mrn: String(mrn).trim(),
          name: patientName || "Unknown Patient",
          organizationId: orgId,
        },
      }),
      2500
    );

    const rxPayload = {
      organizationId: orgId,
      doctorId: user.doctorId || user.id,
      doctorName: prescriptionData.doctorName || user.name,
      chiefComplaint: prescriptionData.chiefComplaint,
      physicalExam: prescriptionData.physicalExam,
      vitals: prescriptionData.vitals,
      diagnosis: prescriptionData.diagnosis,
      investigations: prescriptionData.investigations,
      investigationsList: prescriptionData.investigationsList,
      medicines: prescriptionData.medicines,
      advice: prescriptionData.advice,
      followUp: prescriptionData.followUp,
      theme: prescriptionData.theme,
      savingsBdt: Number(prescriptionData.savingsBdt || 0),
      ddiAlertsCount: Number(prescriptionData.ddiAlertsCount || 0),
    };

    let prescription;

    if (prescriptionData.id) {
      prescription = await withDbTimeout(
        prisma.prescription.update({
          where: { id: String(prescriptionData.id) },
          data: rxPayload,
        }),
        2500
      );
    } else {
      const latest = await withDbTimeout(
        prisma.prescription.findFirst({
          where: { patientId: patient.id, organizationId: orgId },
          orderBy: { updatedAt: 'desc' },
        }),
        2000
      );

      if (latest) {
        prescription = await withDbTimeout(
          prisma.prescription.update({
            where: { id: latest.id },
            data: rxPayload,
          }),
          2500
        );
      } else {
        prescription = await withDbTimeout(
          prisma.prescription.create({
            data: {
              patientId: patient.id,
              ...rxPayload,
            },
          }),
          2500
        );
      }
    }

    return NextResponse.json({ success: true, prescriptionId: prescription.id });
  } catch (error) {
    console.error("Failed to save prescription:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const auth = await requireSessionUser(req);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const mrn = searchParams.get('mrn')?.trim();

    if (!mrn) {
      return NextResponse.json({ error: "MRN is required" }, { status: 400 });
    }

    const patient = await withDbTimeout(
      prisma.patient.findUnique({
        where: { mrn },
        include: {
          prescriptions: {
            where: user.role === "admin" ? {} : { organizationId: user.organizationId },
            orderBy: { updatedAt: 'desc' },
            take: 1,
          },
        },
      }),
      2000
    );

    if (!patient || patient.prescriptions.length === 0) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: patient.prescriptions[0] });
  } catch (error) {
    console.error("Failed to fetch prescription:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
