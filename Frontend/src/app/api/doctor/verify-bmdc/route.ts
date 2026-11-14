import { NextRequest, NextResponse } from "next/server";
import { prisma, withDbTimeout } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/server-auth";

const inMemoryBmdcStore = new Map<string, { bmdcRegNo: string; bmdcStatus: "none" | "pending" | "verified" }>();

export async function GET(request: NextRequest) {
  const auth = await requireSessionUser(request, ["doctor", "admin"]);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const dbUser = await withDbTimeout(
      prisma.user.findUnique({ where: { email: user.email } }),
      1500
    );
    if (dbUser) {
      return NextResponse.json({
        success: true,
        bmdcRegNo: dbUser.bmdcRegNo || "",
        bmdcStatus: (dbUser.bmdcStatus as "none" | "pending" | "verified") || "none",
      });
    }
  } catch {}

  const mem = inMemoryBmdcStore.get(user.email);
  return NextResponse.json({
    success: true,
    bmdcRegNo: mem?.bmdcRegNo || "",
    bmdcStatus: mem?.bmdcStatus || "none",
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireSessionUser(request, ["doctor", "admin"]);
  if (auth.error) return auth.error;
  const { user } = auth;

  try {
    const body = await request.json();
    const bmdcRegNo = String(body.bmdcRegNo || "").trim();
    const targetEmail = user.role === "admin" && body.email ? String(body.email).toLowerCase().trim() : user.email;
    const nextStatus: "none" | "pending" | "verified" =
      user.role === "admin" && (body.status === "verified" || body.status === "none" || body.status === "pending")
        ? body.status
        : "pending";

    if (!bmdcRegNo && nextStatus !== "none") {
      return NextResponse.json({ error: "BMDC Registration Number is required." }, { status: 400 });
    }

    inMemoryBmdcStore.set(targetEmail, { bmdcRegNo, bmdcStatus: nextStatus });

    try {
      await withDbTimeout(
        prisma.user.upsert({
          where: { email: targetEmail },
          update: {
            bmdcRegNo,
            bmdcStatus: nextStatus,
          },
          create: {
            email: targetEmail,
            name: user.name,
            role: user.role || "doctor",
            organizationId: user.organizationId || "org-default",
            bmdcRegNo,
            bmdcStatus: nextStatus,
          },
        }),
        2000
      );

      await withDbTimeout(
        prisma.auditLog.create({
          data: {
            actorId: user.id,
            actorName: user.name,
            actorRole: user.role,
            organizationId: user.organizationId || "org-default",
            action: "BMDC_VERIFY",
            targetType: "User",
            targetId: targetEmail,
            reason: `BMDC ${bmdcRegNo} set to ${nextStatus}`,
          },
        }),
        1500
      );
    } catch {}

    return NextResponse.json({
      success: true,
      bmdcRegNo,
      bmdcStatus: nextStatus,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to submit BMDC credentials." },
      { status: 500 }
    );
  }
}
