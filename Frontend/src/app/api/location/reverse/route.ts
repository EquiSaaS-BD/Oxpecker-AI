import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json(
        { success: false, error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const googleKey =
      process.env.GOOGLE_MAPS_API_KEY ||
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    // 1. Google Reverse Geocoding if key is present
    if (googleKey) {
      try {
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${googleKey}`;
        const gRes = await fetch(gUrl);
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === "OK" && gData.results?.[0]) {
            const result = gData.results[0];
            return NextResponse.json({
              success: true,
              address: result.formatted_address,
              display_name: result.formatted_address,
              provider: "google",
            });
          }
        }
      } catch (gErr) {
        console.warn("Google reverse geocode error, falling back:", gErr);
      }
    }

    // 2. High-precision Nominatim Reverse Geocoding
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`;

    const res = await fetch(reverseUrl, {
      headers: {
        "User-Agent": "Oxpecker-Health-Platform/2.0 (health@oxpecker.ai)",
        "Accept-Language": "bn,en;q=0.8",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "Geocoding service unavailable" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const addr = data.address || {};

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

    const cleanZila = zila.replace(/\s*(জেলা|District)\s*/i, "").trim();

    return NextResponse.json({
      success: true,
      display_name: data.display_name,
      road,
      moholla,
      upazila,
      zila: cleanZila,
      division,
      postcode,
      lat,
      lon,
      provider: "osm",
    });
  } catch (error: any) {
    console.error("Reverse geocoding error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reverse geocode" },
      { status: 500 }
    );
  }
}
