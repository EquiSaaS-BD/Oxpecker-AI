import { NextRequest, NextResponse } from "next/server";
import { AIGateway } from "@/lib/ai/gateway";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ title: "New Chat" }, { status: 400 });
    }

    const gateway = new AIGateway();
    
    // Attempt to generate a short title (max 4 words)
    const prompt = `Generate a very short, concise title (maximum 4 words) for a medical chat based on this first user message: "${message}". The title should summarize the user's intent or symptoms. Return ONLY the title text, nothing else. No quotes, no markdown.`;
    
    const response = await gateway.chat([{ role: "user", content: prompt }]);
    
    if (response) {
      // Clean up the response just in case
      let title = response.replace(/["*]/g, "").trim();
      // Enforce max words roughly
      const words = title.split(" ");
      if (words.length > 5) {
        title = words.slice(0, 4).join(" ") + "...";
      }
      return NextResponse.json({ title });
    }

    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("[Oxpecker AI Title Gen] Error:", error);
    return NextResponse.json({ error: "Failed to generate title" }, { status: 500 });
  }
}
