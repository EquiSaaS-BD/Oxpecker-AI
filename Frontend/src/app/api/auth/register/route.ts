import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { hashPassword, createSessionToken } from "@/lib/authCrypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";
    const name = (body.name || "").trim() || "User";
    const role = body.role || "patient";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id, email")
      .ilike("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // 2. Hash password with PBKDF2-SHA512
    const hashedPassword = hashPassword(password);

    // 3. Insert profile into Supabase
    const profileData: any = {
      name,
      email,
      role,
      status: "active",
      password: hashedPassword,
      phone: body.phone || null,
      date_of_birth: body.date_of_birth || null,
      gender: body.gender || null,
      blood_group: body.blood_group || null,
      address: body.address || null,
      specialty: body.specialty || null,
      hospital_name: body.hospital_name || null,
      join_date: new Date().toISOString().split("T")[0],
    };

    const { data: newProfile, error: profileError } = await supabase
      .from("profiles")
      .insert(profileData)
      .select()
      .single();

    if (profileError || !newProfile) {
      console.error("Supabase profile creation error:", profileError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    // 4. Role specific table linkages
    if (role === "doctor") {
      try {
        await supabase.from("doctors").insert({
          profile_id: newProfile.id,
          name: name,
          specialty: body.specialty || "General Physician",
          hospital: body.hospital_name || "Oxpecker Partner Hospital",
          is_verified: true,
        });
      } catch (docErr) {
        console.warn("Doctor table auto-linking warning:", docErr);
      }
    } else if (role === "hospital") {
      try {
        await supabase.from("hospitals").insert({
          profile_id: newProfile.id,
          name: body.hospital_name || name,
          email: email,
          phone: body.phone || null,
          address: body.address || null,
          is_verified: true,
        });
      } catch (hospErr) {
        console.warn("Hospital table auto-linking warning:", hospErr);
      }
    }

    // 5. Issue session token
    const token = createSessionToken({
      id: newProfile.id,
      email: newProfile.email,
      role: newProfile.role,
      name: newProfile.name,
    });

    const cookieStore = await cookies();
    cookieStore.set("oxpecker_session", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });

    const { password: _pwd, ...safeUser } = newProfile;
    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error("Registration API exception:", err);
    return NextResponse.json(
      { error: "Unexpected error during registration." },
      { status: 500 }
    );
  }
}
