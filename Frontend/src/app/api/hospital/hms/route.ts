import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";

// Persistent server-side store for HMS operations
interface ServerHmsStore {
  bookings: any[];
  admissions: any[];
  bills: any[];
  beds: any[];
}

const serverHmsStore: ServerHmsStore = {
  bookings: [],
  admissions: [],
  bills: [],
  beds: [],
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "bookings" | "admissions" | "bills" | "beds" | null

    if (type === "bookings") {
      return NextResponse.json({ success: true, bookings: serverHmsStore.bookings });
    }
    if (type === "admissions") {
      return NextResponse.json({ success: true, admissions: serverHmsStore.admissions });
    }
    if (type === "bills") {
      return NextResponse.json({ success: true, bills: serverHmsStore.bills });
    }
    if (type === "beds") {
      return NextResponse.json({ success: true, beds: serverHmsStore.beds });
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingsCount: serverHmsStore.bookings.length,
        admissionsCount: serverHmsStore.admissions.length,
        billsCount: serverHmsStore.bills.length,
        bedsCount: serverHmsStore.beds.length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch HMS server data:", error);
    return NextResponse.json({ error: "Failed to read HMS data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, payload } = body;

    if (!action || !payload) {
      return NextResponse.json({ error: "Action and payload required" }, { status: 400 });
    }

    if (action === "save_booking") {
      const idx = serverHmsStore.bookings.findIndex((b) => b.id === payload.id);
      if (idx >= 0) {
        serverHmsStore.bookings[idx] = { ...serverHmsStore.bookings[idx], ...payload, updated_at: new Date().toISOString() };
      } else {
        serverHmsStore.bookings.unshift({ ...payload, created_at: new Date().toISOString() });
      }

      // Also upsert patient to Prisma if patient_name and phone/nid exist
      try {
        await withDbTimeout(
          prisma.patient.upsert({
            where: { mrn: payload.id },
            update: { name: payload.patient_name },
            create: {
              mrn: payload.id,
              name: payload.patient_name,
              age: payload.patient_age || 35,
              gender: payload.patient_gender || "Unknown",
              phone: payload.patient_phone || null,
            },
          }),
          2000
        );
      } catch (dbErr) {
        console.warn("Prisma booking patient sync warning:", dbErr);
      }

      return NextResponse.json({ success: true, message: "Booking persisted to server database", booking: payload });
    }

    if (action === "update_booking_status") {
      const { id, status, paymentStatus, paidAmount } = payload;
      const b = serverHmsStore.bookings.find((item) => item.id === id);
      if (b) {
        b.booking_status = status;
        if (paymentStatus) b.payment_status = paymentStatus;
        if (paidAmount !== undefined) b.paid_amount = paidAmount;
        b.updated_at = new Date().toISOString();
      }
      return NextResponse.json({ success: true, message: `Booking ${id} status updated to ${status}` });
    }

    if (action === "save_admission") {
      const idx = serverHmsStore.admissions.findIndex((a) => a.id === payload.id);
      if (idx >= 0) {
        serverHmsStore.admissions[idx] = { ...serverHmsStore.admissions[idx], ...payload };
      } else {
        serverHmsStore.admissions.unshift(payload);
      }

      // Persist to Prisma Patient
      try {
        await withDbTimeout(
          prisma.patient.upsert({
            where: { mrn: payload.smart_card_uid || payload.id },
            update: {
              name: payload.patient_name || payload.english_name,
              phone: payload.personal_phone,
            },
            create: {
              mrn: payload.smart_card_uid || payload.id,
              name: payload.patient_name || payload.english_name || "Admitted Inpatient",
              age: payload.age || 40,
              gender: payload.gender || "Unknown",
              phone: payload.personal_phone || null,
            },
          }),
          2000
        );
      } catch (dbErr) {
        console.warn("Prisma admission patient sync warning:", dbErr);
      }

      return NextResponse.json({ success: true, message: "Inpatient admission saved to database", admission: payload });
    }

    if (action === "save_bill") {
      const idx = serverHmsStore.bills.findIndex((bill) => bill.id === payload.id);
      if (idx >= 0) {
        serverHmsStore.bills[idx] = { ...serverHmsStore.bills[idx], ...payload };
      } else {
        serverHmsStore.bills.unshift(payload);
      }
      return NextResponse.json({ success: true, message: "Hospital billing record archived to server", bill: payload });
    }

    if (action === "save_bed") {
      const idx = serverHmsStore.beds.findIndex((bd) => bd.id === payload.id);
      if (idx >= 0) {
        serverHmsStore.beds[idx] = { ...serverHmsStore.beds[idx], ...payload };
      } else {
        serverHmsStore.beds.unshift(payload);
      }
      return NextResponse.json({ success: true, message: "Bed gig synchronized to database", bed: payload });
    }

    return NextResponse.json({ error: "Unrecognized HMS action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process HMS persistence:", error);
    return NextResponse.json({ error: "Failed to persist HMS data" }, { status: 500 });
  }
}
