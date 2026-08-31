import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        prescriptions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Map to frontend format
    const formattedPatients = patients.map(p => {
      // Find latest prescription for diagnosis, etc.
      const latestRx = p.prescriptions[0];

      return {
        id: p.mrn,
        name: p.name,
        age: p.age || 0,
        gender: p.gender || "Unknown",
        type: "Walk-in", // Default type
        date: p.createdAt.toISOString(),
        status: "Completed",
        diagnosis: latestRx?.diagnosis || "Not specified",
        assistant: "System",
        paymentStatus: "Paid",
        avatar: p.name.charAt(0).toUpperCase(),
        // Extra payload for Drawer
        dbId: p.id,
        prescriptions: p.prescriptions.map(rx => ({
          id: rx.id,
          date: rx.createdAt.toISOString(),
          diagnosis: rx.diagnosis,
          medicines: rx.medicines ? JSON.parse(JSON.stringify(rx.medicines)) : []
        }))
      };
    });

    return NextResponse.json({ success: true, data: formattedPatients });
  } catch (error) {
    console.error("Failed to fetch patients:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
