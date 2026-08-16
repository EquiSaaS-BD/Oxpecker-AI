import { NextRequest, NextResponse } from "next/server";
import { GoogleProvider } from "@/lib/ai/providers/google";
import { AIGateway } from "@/lib/ai/gateway";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ title: "New Chat" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
    
    // Attempt to generate a short title (max 4 words)
    const prompt = `Generate a very short, concise title (maximum 4 words) for a medical chat based on this first user message: "${message}". The title should summarize the user's intent or symptoms. Return ONLY the title text, nothing else. No quotes, no markdown.`;
    
    if (apiKey) {
      try {
        const googleProvider = new GoogleProvider({ apiKey });
        const gateway = new AIGateway([
          { name: "google", provider: googleProvider, priority: 1, isEnabled: true }
        ]);
        const response = await gateway.chat([{ role: "user", content: prompt }]);
        
        if (response && response.content) {
          let title = response.content.replace(/["*]/g, "").trim();
          const words = title.split(" ");
          if (words.length > 5) {
            title = words.slice(0, 4).join(" ") + "...";
          }
          return NextResponse.json({ title });
        }
      } catch (aiErr) {
        console.warn("[Title Gen] AI generation fallback:", aiErr);
      }
    }

    // Smart algorithmic fallback
    const cleaned = message.replace(/[\n\r]+/g, " ").trim();
    const words = cleaned.split(" ").slice(0, 4).join(" ");
    return NextResponse.json({ title: words ? `${words}...` : "Medical Consultation" });
  } catch (error) {
    console.error("[Oxpecker AI Title Gen] Error:", error);
    return NextResponse.json({ title: "Medical Consultation" });
  }
}
