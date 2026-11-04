import { NextResponse } from "next/server";

// In-memory translation cache to make repeat translations instantaneous
const translationCache = new Map<string, Record<string, string>>();

async function translateSingleText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return text;
  try {
const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      targetLang
    )}&dt=t`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const params = new URLSearchParams();
    params.append("q", text);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      body: params.toString(),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return text;
    const data = await res.json();
    if (Array.isArray(data) && Array.isArray(data[0])) {
      return data[0]
        .map((seg: any) => (Array.isArray(seg) && seg[0] ? seg[0] : ""))
        .join("");
    }
    return text;
  } catch {
    return text;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { medicineId, targetLang, fields } = body as {
      medicineId: string;
      targetLang: string;
      fields: Record<string, string>;
    };

    if (!targetLang || targetLang === "en" || !fields || typeof fields !== "object") {
      return NextResponse.json({ success: true, translated: fields || {} });
    }

    const cacheKey = `${medicineId || "anon"}:${targetLang}`;
    const cached = translationCache.get(cacheKey) || {};
    const result: Record<string, string> = { ...cached };

    const entriesToTranslate = Object.entries(fields).filter(
      ([key, val]) => typeof val === "string" && val.trim().length > 0 && !result[key]
    );

    if (entriesToTranslate.length > 0) {
      await Promise.all(
        entriesToTranslate.map(async ([key, val]) => {
          const translated = await translateSingleText(val, targetLang);
          result[key] = translated;
        })
      );
      translationCache.set(cacheKey, result);
    }

    return NextResponse.json({
      success: true,
      translated: result,
    });
  } catch (error) {
    console.error("Medicine translation error:", error);
    return NextResponse.json(
      { success: false, error: "Translation failed" },
      { status: 500 }
    );
  }
}
