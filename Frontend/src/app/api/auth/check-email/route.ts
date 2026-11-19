import { NextRequest, NextResponse } from "next/server";
import { findAccountByEmail, isValidEmailFormat, normalizeEmail } from "@/lib/auth-registry";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawEmail = searchParams.get("email") || "";
  const email = normalizeEmail(rawEmail);

  if (!email || !isValidEmailFormat(email)) {
    return NextResponse.json({ available: false, valid: false, exists: false }, { status: 400 });
  }

  const found = await findAccountByEmail(email);
  return NextResponse.json({
    available: !found.exists,
    valid: true,
    exists: found.exists,
    role: found.user?.role || null,
  });
}
