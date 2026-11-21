import { NextResponse } from "next/server";
import { getMedicineSnapshotMetadata } from "@/lib/medicine-catalog";
import { loadIndexedMedicines } from "@/lib/medicine-index";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const slug = searchParams.get("slug")?.trim().toLowerCase();
    const q = searchParams.get("q")?.toLowerCase().trim() || "";
    const category = searchParams.get("category") || "All";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

    const allMedicines = loadIndexedMedicines();

    if (allMedicines.length === 0) {
      return NextResponse.json({ error: "Database not found or empty." }, { status: 500 });
    }

    if (id || slug) {
      const match = allMedicines.find(
        (entry) =>
          (id && entry.item.id === id) ||
          (slug && String(entry.item.slug || "").toLowerCase() === slug)
      );
      if (!match) {
        return NextResponse.json({ error: "Medicine not found." }, { status: 404 });
      }
      const { fullIndicationDescription, ...rest } = match.item;
      return NextResponse.json(
        {
          priceSnapshot: getMedicineSnapshotMetadata(),
          data: {
            ...rest,
            indicationDescription: fullIndicationDescription || rest.indicationDescription,
          },
        },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    let filtered = allMedicines;

    if (category !== "All") {
      filtered = filtered.filter((entry) => entry.item.category === category);
    }

    if (q) {
      filtered = filtered.filter(
        (entry) =>
          entry.nameLower.includes(q) ||
          entry.genericLower.includes(q) ||
          entry.companyLower.includes(q) ||
          entry.useForLower.includes(q)
      );

      filtered.sort((a, b) => {
        const getScore = (name: string, gen: string) => {
          if (name === q) return 100;
          if (gen === q) return 90;
          if (name.startsWith(q)) return 80;
          if (gen.startsWith(q)) return 70;
          if (name.includes(` ${q}`) || name.includes(`${q} `)) return 60;
          if (gen.includes(` ${q}`) || gen.includes(`${q} `)) return 50;
          return 10;
        };

        const scoreA = getScore(a.nameLower, a.genericLower);
        const scoreB = getScore(b.nameLower, b.genericLower);

        if (scoreA !== scoreB) {
          return scoreB - scoreA;
        }
        return a.nameLower.localeCompare(b.nameLower);
      });
    }

    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filtered.slice(startIndex, endIndex).map((entry) => {
      const { fullIndicationDescription: _omit, ...listItem } = entry.item;
      return listItem;
    });
    const hasMore = endIndex < totalCount;

    return NextResponse.json(
      {
        totalCount,
        page,
        limit,
        hasMore,
        priceSnapshot: getMedicineSnapshotMetadata(),
        data: paginatedResults,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[Medicine API] Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
