import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { verifyPassword, hashPassword, createSessionToken } from "@/lib/authCrypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = (body.email || "").toLowerCase().trim();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Fetch user profile from Supabase
    const { data: userProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", email)
      .maybeSingle();

    if (fetchError) {
      console.error("Database query error on login:", fetchError);
      return NextResponse.json(
        { error: "Internal server error. Please try again." },
        { status: 500 }
      );
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: "No account found with this email. Please register first." },
        { status: 401 }
      );
    }

    // 2. Cryptographic Password Verification
    const isPasswordValid = verifyPassword(password, userProfile.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password. Please verify your credentials." },
        { status: 401 }
      );
    }

    // 3. Transparently upgrade legacy plain-text password to PBKDF2 salt-hash
    if (userProfile.password && !userProfile.password.includes(":")) {
      const secureHash = hashPassword(password);
      await supabase
        .from("profiles")
        .update({ password: secureHash })
        .eq("id", userProfile.id);
    }

    // 4. Create cryptographically signed session token
    const token = createSessionToken({
      id: userProfile.id,
      email: userProfile.email,
      role: userProfile.role,
      name: userProfile.name,
    });

    // 5. Store session cookie
    const cookieStore = await cookies();
    cookieStore.set("oxpecker_session", token, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Accessible to client auth state reader
    });

    // Return safe user profile (without password hash)
    const { password: _pwd, ...safeUser } = userProfile;
    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error("Login API exception:", err);
    return NextResponse.json(
      { error: "Unexpected error during login. Please try again." },
      { status: 500 }
    );
  }
}
