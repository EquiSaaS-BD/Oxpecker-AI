import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ title: "New Chat" }, { status: 400 });
    }
    
    // For UI/UX overhaul purposes, generating a simple title
    // to avoid complex gateway configuration issues.
    const words = message.split(" ");
    const title = words.slice(0, 4).join(" ") + "...";
    
    return NextResponse.json({ title });
  } catch (error) {
    console.error("[Oxpecker AI Title Gen] Error:", error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
