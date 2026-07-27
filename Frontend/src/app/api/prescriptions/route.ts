import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { patientId: mrn, patientName, ...prescriptionData } = data;

    if (!mrn) {
      return NextResponse.json({ error: "Patient ID (MRN) is required" }, { status: 400 });
    }

    // Upsert Patient by MRN
    const patient = await prisma.patient.upsert({
      where: { mrn },
      update: { name: patientName },
      create: {
        mrn,
        name: patientName || "Unknown Patient",
      },
    });

    // We'll either create a new prescription or update the existing one for this patient
    // If the frontend sends an 'id', we update that specific prescription.
    // Otherwise, we check if there's an active draft (e.g. created today), or just create a new one.
    let prescription;

    if (prescriptionData.id) {
      prescription = await prisma.prescription.update({
        where: { id: prescriptionData.id },
        data: {
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
        },
      });
    } else {
      // Find latest prescription to avoid creating too many empty ones
      const latest = await prisma.prescription.findFirst({
        where: { patientId: patient.id },
        orderBy: { updatedAt: 'desc' }
      });

      if (latest) {
        prescription = await prisma.prescription.update({
          where: { id: latest.id },
          data: {
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
          },
        });
      } else {
        prescription = await prisma.prescription.create({
          data: {
            patientId: patient.id,
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
          },
        });
      }
    }

    return NextResponse.json({ success: true, prescriptionId: prescription.id });
  } catch (error) {
    console.error("Failed to save prescription:", error);
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mrn = searchParams.get('mrn');

    if (!mrn) {
      return NextResponse.json({ error: "MRN is required" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { mrn },
      include: {
        prescriptions: {
          orderBy: { updatedAt: 'desc' },
          take: 1, // Get the most recent draft
        }
      }
    });

    if (!patient || patient.prescriptions.length === 0) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: patient.prescriptions[0] });
  } catch (error) {
    console.error("Failed to fetch prescription:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
