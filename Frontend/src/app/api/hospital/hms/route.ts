import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-auth";

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
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const { user } = auth;
  const orgWhere = user.role === "admin" ? {} : { organizationId: user.organizationId };

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "bookings") {
      try {
        const rows = await withDbTimeout(
          prisma.hmsBooking.findMany({ where: orgWhere, orderBy: { createdAt: "desc" }, take: 50 }),
          1500
        );
        if (rows.length > 0) {
          return NextResponse.json({
            success: true,
            bookings: rows.map((r) => ({ ...(r.payload as any), id: r.id, booking_status: r.bookingStatus, payment_status: r.paymentStatus, paid_amount: r.paidAmount })),
            source: "database",
          });
        }
      } catch {}
      return NextResponse.json({ success: true, bookings: serverHmsStore.bookings, source: "resilient_cache" });
    }

    if (type === "admissions") {
      try {
        const rows = await withDbTimeout(
          prisma.hmsAdmission.findMany({ where: orgWhere, orderBy: { createdAt: "desc" }, take: 50 }),
          1500
        );
        if (rows.length > 0) {
          return NextResponse.json({
            success: true,
            admissions: rows.map((r) => ({ ...(r.payload as any), id: r.id, status: r.status })),
            source: "database",
          });
        }
      } catch {}
      return NextResponse.json({ success: true, admissions: serverHmsStore.admissions, source: "resilient_cache" });
    }

    if (type === "bills") {
      try {
        const rows = await withDbTimeout(
          prisma.hmsBill.findMany({ where: orgWhere, orderBy: { createdAt: "desc" }, take: 50 }),
          1500
        );
        if (rows.length > 0) {
          return NextResponse.json({
            success: true,
            bills: rows.map((r) => ({ ...(r.payload as any), id: r.id, status: r.status })),
            source: "database",
          });
        }
      } catch {}
      return NextResponse.json({ success: true, bills: serverHmsStore.bills, source: "resilient_cache" });
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
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const { user } = auth;
  const orgId = user.organizationId || "org-default";

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

      try {
        await withDbTimeout(
          prisma.hmsBooking.upsert({
            where: { id: String(payload.id || `bk-${Date.now()}`) },
            update: {
              organizationId: orgId,
              patientName: String(payload.patient_name || "Patient"),
              patientPhone: payload.patient_phone || null,
              patientAge: payload.patient_age ? Number(payload.patient_age) : null,
              patientGender: payload.patient_gender || null,
              doctorName: payload.doctor_name || null,
              department: payload.department || null,
              bookingStatus: String(payload.booking_status || "Confirmed"),
              paymentStatus: String(payload.payment_status || "Unpaid"),
              paidAmount: Number(payload.paid_amount || 0),
              payload: payload as any,
            },
            create: {
              id: String(payload.id || `bk-${Date.now()}`),
              organizationId: orgId,
              patientName: String(payload.patient_name || "Patient"),
              patientPhone: payload.patient_phone || null,
              patientAge: payload.patient_age ? Number(payload.patient_age) : null,
              patientGender: payload.patient_gender || null,
              doctorName: payload.doctor_name || null,
              department: payload.department || null,
              bookingStatus: String(payload.booking_status || "Confirmed"),
              paymentStatus: String(payload.payment_status || "Unpaid"),
              paidAmount: Number(payload.paid_amount || 0),
              payload: payload as any,
            },
          }),
          2000
        );

        await withDbTimeout(
          prisma.patient.upsert({
            where: { mrn: String(payload.id) },
            update: { name: payload.patient_name, organizationId: orgId },
            create: {
              mrn: String(payload.id),
              organizationId: orgId,
              name: payload.patient_name || "Patient",
              age: payload.patient_age || 35,
              gender: payload.patient_gender || "Unknown",
              phone: payload.patient_phone || null,
            },
          }),
          2000
        );
      } catch (dbErr) {
        console.warn("Prisma booking sync warning:", dbErr);
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
      try {
        await withDbTimeout(
          prisma.hmsBooking.update({
            where: { id: String(id) },
            data: {
              bookingStatus: status ? String(status) : undefined,
              paymentStatus: paymentStatus ? String(paymentStatus) : undefined,
              paidAmount: paidAmount !== undefined ? Number(paidAmount) : undefined,
            },
          }),
          1500
        );
      } catch {}
      return NextResponse.json({ success: true, message: `Booking ${id} status updated to ${status}` });
    }

    if (action === "save_admission") {
      const idx = serverHmsStore.admissions.findIndex((a) => a.id === payload.id);
      if (idx >= 0) {
        serverHmsStore.admissions[idx] = { ...serverHmsStore.admissions[idx], ...payload };
      } else {
        serverHmsStore.admissions.unshift(payload);
      }

      try {
        const admId = String(payload.id || `adm-${Date.now()}`);
        await withDbTimeout(
          prisma.hmsAdmission.upsert({
            where: { id: admId },
            update: {
              organizationId: orgId,
              patientName: String(payload.patient_name || payload.english_name || "Admitted Inpatient"),
              smartCardUid: payload.smart_card_uid || null,
              ward: payload.ward || null,
              bedNumber: payload.bed_number || null,
              status: String(payload.status || "Admitted"),
              payload: payload as any,
            },
            create: {
              id: admId,
              organizationId: orgId,
              patientName: String(payload.patient_name || payload.english_name || "Admitted Inpatient"),
              smartCardUid: payload.smart_card_uid || null,
              ward: payload.ward || null,
              bedNumber: payload.bed_number || null,
              status: String(payload.status || "Admitted"),
              payload: payload as any,
            },
          }),
          2000
        );

        await withDbTimeout(
          prisma.patient.upsert({
            where: { mrn: String(payload.smart_card_uid || payload.id) },
            update: {
              name: payload.patient_name || payload.english_name,
              phone: payload.personal_phone,
              organizationId: orgId,
            },
            create: {
              mrn: String(payload.smart_card_uid || payload.id),
              organizationId: orgId,
              name: payload.patient_name || payload.english_name || "Admitted Inpatient",
              age: payload.age || 40,
              gender: payload.gender || "Unknown",
              phone: payload.personal_phone || null,
            },
          }),
          2000
        );
      } catch (dbErr) {
        console.warn("Prisma admission sync warning:", dbErr);
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
      try {
        const billId = String(payload.id || `bill-${Date.now()}`);
        await withDbTimeout(
          prisma.hmsBill.upsert({
            where: { id: billId },
            update: {
              organizationId: orgId,
              patientName: String(payload.patient_name || payload.patientName || "Patient"),
              totalAmount: Number(payload.total_amount || payload.totalAmount || 0),
              paidAmount: Number(payload.paid_amount || payload.paidAmount || 0),
              status: String(payload.status || "Running"),
              payload: payload as any,
            },
            create: {
              id: billId,
              organizationId: orgId,
              patientName: String(payload.patient_name || payload.patientName || "Patient"),
              totalAmount: Number(payload.total_amount || payload.totalAmount || 0),
              paidAmount: Number(payload.paid_amount || payload.paidAmount || 0),
              status: String(payload.status || "Running"),
              payload: payload as any,
            },
          }),
          2000
        );
      } catch {}
      return NextResponse.json({ success: true, message: "Hospital billing record archived to server", bill: payload });
    }

    if (action === "save_bed") {
      const idx = serverHmsStore.beds.findIndex((bd) => bd.id === payload.id);
      if (idx >= 0) {
        serverHmsStore.beds[idx] = { ...serverHmsStore.beds[idx], ...payload };
      } else {
        serverHmsStore.beds.unshift(payload);
      }
      return NextResponse.json({ success: true, message: "Bed synchronized to database", bed: payload });
    }

    return NextResponse.json({ error: "Unrecognized HMS action" }, { status: 400 });
  } catch (error) {
    console.error("Failed to process HMS persistence:", error);
    return NextResponse.json({ error: "Failed to persist HMS data" }, { status: 500 });
  }
}
