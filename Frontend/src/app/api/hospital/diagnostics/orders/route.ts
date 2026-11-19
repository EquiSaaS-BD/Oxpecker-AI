import { NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import {
  createDiagnosticOrder,
  getDiagnosticOrders,
  updateDiagnosticOrderStatus,
  type DiagnosticOrderItem,
  type DiagnosticOrderStatus,
} from "@/lib/hospital-diagnostics";
import { requireSessionUser } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "";
  const priorityFilter = searchParams.get("priority") || "";
  const smartCardUid = searchParams.get("smartCardUid") || "";
  const search = (searchParams.get("search") || "").trim().toLowerCase();

  let orders: DiagnosticOrderItem[] = getDiagnosticOrders();

  if (process.env.DATABASE_URL) {
    try {
      const orgWhere = auth.user.role === "admin" ? {} : { organizationId: auth.user.organizationId };
      const rows = await withDbTimeout(
        prisma.diagnosticOrder.findMany({ where: orgWhere, orderBy: { createdAt: "desc" }, take: 100 }),
        1200
      );
      if (rows.length > 0) {
        orders = rows.map((r) => ({
          id: r.id,
          accessionId: r.accessionId,
          organizationId: r.organizationId,
          patientName: r.patientName,
          patientAge: r.patientAge || 35,
          patientGender: r.patientGender || "Male",
          patientPhone: r.patientPhone || "",
          smartCardUid: r.smartCardUid || undefined,
          referringDoctor: r.referringDoctor || "Attending Doctor",
          source: (r.source as DiagnosticOrderItem["source"]) || "Walk-In",
          priority: (r.priority as DiagnosticOrderItem["priority"]) || "Routine",
          status: (r.status as DiagnosticOrderStatus) || "Ordered",
          tests: Array.isArray(r.tests) ? (r.tests as any[]) : [],
          totalAmount: r.totalAmount,
          discountAmount: r.discountAmount,
          paidAmount: r.paidAmount,
          paymentStatus: (r.paymentStatus as DiagnosticOrderItem["paymentStatus"]) || "Unpaid",
          paymentMethod: r.paymentMethod || undefined,
          collectorName: r.collectorName || undefined,
          collectedAt: r.collectedAt?.toISOString(),
          billId: r.billId || undefined,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
      }
    } catch {}
  }

  const filtered = orders.filter((o) => {
    if (statusFilter && statusFilter !== "All" && o.status !== statusFilter) return false;
    if (priorityFilter && priorityFilter !== "All" && o.priority !== priorityFilter) return false;
    if (smartCardUid && o.smartCardUid !== smartCardUid) return false;
    if (search) {
      const hay = `${o.accessionId} ${o.patientName} ${o.patientPhone} ${o.smartCardUid || ""} ${o.referringDoctor}`.toLowerCase();
      if (!hay.includes(search)) return false;
    }
    return true;
  });

  return NextResponse.json({ success: true, orders: filtered });
}

export async function POST(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;
  const orgId = auth.user.organizationId || "org-default";

  try {
    const body = await req.json();
    if (!body.patientName || !Array.isArray(body.tests) || body.tests.length === 0) {
      return NextResponse.json({ error: "Patient name and at least one test are required." }, { status: 400 });
    }

    const order = createDiagnosticOrder({
      organizationId: orgId,
      patientName: String(body.patientName),
      patientAge: body.patientAge ? Number(body.patientAge) : 35,
      patientGender: body.patientGender || "Male",
      patientPhone: body.patientPhone || "",
      smartCardUid: body.smartCardUid || undefined,
      referringDoctor: body.referringDoctor || "Self / Walk-In",
      source: body.source || "Walk-In",
      priority: body.priority || "Routine",
      tests: body.tests,
      discountAmount: Number(body.discountAmount || 0),
      paidAmount: Number(body.paidAmount || 0),
      paymentMethod: body.paymentMethod || "Cash",
    });

    if (process.env.DATABASE_URL) {
      try {
        await withDbTimeout(
          prisma.diagnosticOrder.create({
            data: {
              id: order.id,
              accessionId: order.accessionId,
              organizationId: orgId,
              patientName: order.patientName,
              patientAge: order.patientAge,
              patientGender: order.patientGender,
              patientPhone: order.patientPhone || null,
              smartCardUid: order.smartCardUid || null,
              referringDoctor: order.referringDoctor,
              source: order.source,
              priority: order.priority,
              status: order.status,
              tests: order.tests as any,
              totalAmount: order.totalAmount,
              discountAmount: order.discountAmount,
              paidAmount: order.paidAmount,
              paymentStatus: order.paymentStatus,
              paymentMethod: order.paymentMethod || null,
            },
          }),
          1500
        );

        // Also record consolidated HmsBill entry
        const net = Math.max(0, order.totalAmount - order.discountAmount);
        await withDbTimeout(
          prisma.hmsBill.create({
            data: {
              organizationId: orgId,
              patientName: order.patientName,
              totalAmount: net,
              paidAmount: order.paidAmount,
              status: order.paymentStatus === "Paid" ? "Settled" : "Running",
              payload: {
                accessionId: order.accessionId,
                category: "Diagnostic Lab",
                tests: order.tests,
              } as any,
            },
          }),
          1200
        );
      } catch {}
    }

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to create diagnostic order." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const auth = await requireSessionUser(req, ["hospital", "doctor", "assistant", "admin"]);
  if (auth.error) return auth.error;

  try {
    const body = await req.json();
    const orderId = String(body.id || body.orderId || body.accessionId || "");
    const status = String(body.status || "") as DiagnosticOrderStatus;
    if (!orderId || !status) {
      return NextResponse.json({ error: "Order id and status are required." }, { status: 400 });
    }

    const updated = updateDiagnosticOrderStatus(orderId, status, {
      collectorName: body.collectorName,
      paidAmount: body.paidAmount !== undefined ? Number(body.paidAmount) : undefined,
      paymentMethod: body.paymentMethod,
    });

    if (process.env.DATABASE_URL) {
      try {
        await withDbTimeout(
          prisma.diagnosticOrder.updateMany({
            where: { OR: [{ id: orderId }, { accessionId: orderId }] },
            data: {
              status,
              collectorName: body.collectorName || undefined,
              collectedAt: status === "Sample Collected" ? new Date() : undefined,
              paidAmount: body.paidAmount !== undefined ? Number(body.paidAmount) : undefined,
              paymentMethod: body.paymentMethod || undefined,
            },
          }),
          1200
        );
      } catch {}
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Failed to update diagnostic order." }, { status: 500 });
  }
}
