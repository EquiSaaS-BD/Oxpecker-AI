import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/authCrypto";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("oxpecker_session")?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const { data: userProfile } = await supabase
    .from("profiles")
    .select("id, name, email, role, phone, date_of_birth, gender, blood_group, address, image, specialty, hospital_name, status, join_date")
    .eq("id", payload.userId)
    .maybeSingle();

  if (!userProfile) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: userProfile,
  });
}
