import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, predictions: [] });
    }

    const googleKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. Try Google Places Autocomplete API if key exists
    if (googleKey) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&components=country:bd&key=${googleKey}`;
        const gRes = await fetch(googleUrl, { next: { revalidate: 3600 } });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === "OK" && gData.predictions) {
            const predictions = gData.predictions.map((p: any) => ({
              place_id: p.place_id,
              display_name: p.description,
              main_text: p.structured_formatting?.main_text || p.description,
              secondary_text:
                p.structured_formatting?.secondary_text || "Bangladesh",
              provider: "google",
            }));
            return NextResponse.json({ success: true, predictions });
          }
        }
      } catch (gErr) {
        console.warn("Google Places API error, falling back to geocoding:", gErr);
      }
    }

    // 2. High-Precision Bangladesh Gram/Moholla/Thana Geocoder (Nominatim)
    // Supports both Bangla and English natively
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=bd&addressdetails=1&limit=8&q=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(nominatimUrl, {
      headers: {
        "User-Agent": "Oxpecker-Health-Platform/2.0 (health@oxpecker.ai)",
        "Accept-Language": "bn,en;q=0.8",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json({ success: true, predictions: [] });
    }

    const items = await res.json();
    if (!Array.isArray(items)) {
      return NextResponse.json({ success: true, predictions: [] });
    }

    const predictions = items.map((item: any) => {
      const addr = item.address || {};
      const road = addr.road || addr.street || "";
      const moholla =
        addr.quarter ||
        addr.suburb ||
        addr.neighbourhood ||
        addr.village ||
        addr.hamlet ||
        "";
      const upazila = addr.county || addr.subdistrict || addr.city_district || "";
      const zila =
        addr.state_district ||
        addr.city ||
        addr.town ||
        addr.district ||
        "Dhaka";
      const division = addr.state || "";
      const postcode = addr.postcode || "";

      // Clean district string (remove "জেলা" suffix if present for clean matching)
      const cleanZila = zila.replace(/\s*(জেলা|District)\s*/i, "").trim();

      const mainTextParts = [road, moholla].filter(Boolean);
      const secondaryParts = [upazila, cleanZila, postcode, "বাংলাদেশ"].filter(
        Boolean
      );

      return {
        place_id: String(item.place_id || item.osm_id),
        display_name: item.display_name,
        main_text: mainTextParts.join(", ") || item.name || query,
        secondary_text: secondaryParts.join(", "),
        road,
        moholla,
        upazila,
        zila: cleanZila,
        division,
        postcode,
        lat: item.lat,
        lon: item.lon,
        provider: "osm",
      };
    });

    return NextResponse.json({
      success: true,
      predictions,
    });
  } catch (error: any) {
    console.error("Location autocomplete error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
