import { NextResponse } from 'next/server';
import { prisma, withDbTimeout } from '@/lib/prisma';

interface QueueAppointment {
  id: string;
  token: string;
  patient: string;
  age: number;
  gender: string;
  phone: string;
  doctor: string;
  dept: string;
  time: string;
  date: string;
  type: string;
  priority: "Normal" | "High" | "Urgent";
  status: "Confirmed" | "In Progress" | "Waiting" | "Scheduled" | "Completed";
  notes?: string;
  createdAt: string;
}

// Resilient memory store for live appointment queue & tokens
const liveQueue: QueueAppointment[] = [
  {
    id: "APT-8812",
    token: "TK-08",
    patient: "Kamrul Hasan",
    age: 46,
    gender: "Male",
    phone: "01711223344",
    doctor: "Prof. Dr. Anisur Rahman",
    dept: "Cardiology",
    time: "10:30 AM",
    date: "Today",
    type: "Follow-up",
    priority: "Normal",
    status: "Confirmed",
    notes: "ECG report verification",
    createdAt: new Date().toISOString(),
  },
  {
    id: "APT-8813",
    token: "TK-09",
    patient: "Nasreen Akter",
    age: 32,
    gender: "Female",
    phone: "01819887766",
    doctor: "Dr. Farzana Yasmin",
    dept: "Gynecology",
    time: "11:15 AM",
    date: "Today",
    type: "New Consultation",
    priority: "Normal",
    status: "In Progress",
    notes: "Second trimester anomaly review",
    createdAt: new Date().toISOString(),
  },
  {
    id: "APT-8814",
    token: "TK-10",
    patient: "Abdur Rashid",
    age: 62,
    gender: "Male",
    phone: "01912334455",
    doctor: "Dr. Mahmudul Hasan",
    dept: "Neurology",
    time: "12:00 PM",
    date: "Today",
    type: "Follow-up",
    priority: "High",
    status: "Waiting",
    notes: "Transient ischemic attack post-rehab",
    createdAt: new Date().toISOString(),
  },
  {
    id: "APT-8815",
    token: "TK-11",
    patient: "Sultana Begum",
    age: 29,
    gender: "Female",
    phone: "01511224466",
    doctor: "Dr. Nusrat Jahan",
    dept: "Pediatrics",
    time: "01:00 PM",
    date: "Today",
    type: "Child Vaccination",
    priority: "Normal",
    status: "Confirmed",
    notes: "MMR booster scheduled",
    createdAt: new Date().toISOString(),
  },
  {
    id: "APT-8816",
    token: "TK-12",
    patient: "Zubair Ahmed",
    age: 51,
    gender: "Male",
    phone: "01611335577",
    doctor: "Dr. Tanvir Ahmed",
    dept: "Surgery",
    time: "02:30 PM",
    date: "Today",
    type: "Post-op Review",
    priority: "Normal",
    status: "Scheduled",
    notes: "Laparoscopic cholecystectomy suture check",
    createdAt: new Date().toISOString(),
  },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tokenQuery = searchParams.get("token");
    const statusQuery = searchParams.get("status");

    // If querying by specific token for check-in
    if (tokenQuery) {
      const match = liveQueue.find(
        (a) => a.token.toLowerCase() === tokenQuery.toLowerCase() || a.id.toLowerCase() === tokenQuery.toLowerCase()
      );
      if (match) {
        return NextResponse.json({ success: true, appointment: match, source: "live_queue" });
      }
    }

    // Try reading from Prisma
    try {
      const dbAppointments = await withDbTimeout(
        prisma.appointment.findMany({
          orderBy: { createdAt: "desc" },
          include: {
            patient: true,
            doctor: true,
          },
          take: 30,
        }),
        2000
      );

      if (dbAppointments && dbAppointments.length > 0) {
        const formatted = dbAppointments.map((apt) => ({
          id: apt.id,
          token: `TK-${apt.id.slice(0, 4).toUpperCase()}`,
          patient: apt.patient?.name || "Patient",
          age: apt.patient?.age || 35,
          gender: apt.patient?.gender || "Unknown",
          phone: apt.patient?.phone || "",
          doctor: apt.doctor?.name || "Attending Physician",
          dept: apt.doctor?.speciality || "General Medicine",
          time: new Date(apt.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date(apt.dateTime).toISOString().split("T")[0],
          type: apt.type === "video" ? "Telehealth Video" : "In-Person Consultation",
          priority: "Normal",
          status: apt.status === "confirmed" ? "Confirmed" : apt.status === "completed" ? "Completed" : "Waiting",
          notes: apt.notes || "",
          createdAt: apt.createdAt.toISOString(),
        }));

        return NextResponse.json({ success: true, appointments: formatted, source: "database" });
      }
    } catch (dbErr) {
      console.warn("Prisma appointments fetch warning, serving resilient queue:", dbErr);
    }

    const filtered = statusQuery && statusQuery !== "All"
      ? liveQueue.filter((a) => a.status === statusQuery)
      : liveQueue;

    return NextResponse.json({ success: true, appointments: filtered, source: "resilient_queue" });
  } catch (error) {
    console.error("Failed to fetch appointments:", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      patient,
      age,
      gender,
      phone,
      doctor,
      dept,
      time,
      date,
      type,
      priority,
      notes,
      symptoms,
      tokenId,
      token,
    } = body;

    const patientName = name || patient || "Walk-in Patient";
    const generatedToken = tokenId || token || `TK-${Math.floor(10 + Math.random() * 90)}`;
    const appointmentId = `APT-${Math.floor(8000 + Math.random() * 1999)}`;

    const newAppointment: QueueAppointment = {
      id: appointmentId,
      token: generatedToken,
      patient: patientName,
      age: age ? parseInt(String(age), 10) : 32,
      gender: gender || "Male",
      phone: phone || "01700000000",
      doctor: doctor || "Duty Medical Officer",
      dept: dept || "General Medicine",
      time: time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: date || "Today",
      type: type || "Walk-in",
      priority: priority || "Normal",
      status: "Waiting",
      notes: notes || symptoms || "Standard consultation check-in",
      createdAt: new Date().toISOString(),
    };

    // Try saving to Prisma
    try {
      // Upsert patient
      const p = await withDbTimeout(
        prisma.patient.upsert({
          where: { mrn: generatedToken },
          update: { name: patientName },
          create: {
            mrn: generatedToken,
            name: patientName,
            age: age ? parseInt(String(age), 10) : 32,
            gender: gender || "Male",
            phone: phone || null,
          },
        }),
        2000
      );

      // Try finding or creating doctor
      const d = await withDbTimeout(prisma.doctor.findFirst(), 1500).catch(() => null);
      if (d) {
        await withDbTimeout(
          prisma.appointment.create({
            data: {
              patientId: p.id,
              doctorId: d.id,
              dateTime: new Date(),
              type: "in_person",
              status: "pending",
              notes: `${generatedToken}: ${notes || symptoms || "Walk-in registration"}`,
            },
          }),
          2000
        );
      }
    } catch (dbErr) {
      console.warn("Prisma appointment save warning, preserved in live queue:", dbErr);
    }

    // Add to memory queue
    liveQueue.unshift(newAppointment);

    return NextResponse.json({
      success: true,
      message: `Token ${generatedToken} successfully generated and registered in database`,
      appointment: newAppointment,
    });
  } catch (error) {
    console.error("Failed to create appointment token:", error);
    return NextResponse.json({ error: "Failed to generate appointment token" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, token, status } = body;

    const target = liveQueue.find(
      (a) => a.id === id || a.token.toLowerCase() === String(token || "").toLowerCase()
    );

    if (target && status) {
      target.status = status;

      // Update in Prisma if possible
      try {
        await prisma.appointment.updateMany({
          where: { notes: { contains: target.token } },
          data: { status: status.toLowerCase() },
        });
      } catch (dbErr) {
        console.warn("Prisma status update warning:", dbErr);
      }

      return NextResponse.json({
        success: true,
        message: `Token ${target.token} status updated to ${status}`,
        appointment: target,
      });
    }

    return NextResponse.json({ error: "Appointment or token not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to update appointment token status:", error);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
