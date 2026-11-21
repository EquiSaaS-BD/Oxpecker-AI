import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import zlib from "zlib";

let cachedHospitals: any[] | null = null;
let cachedHospitalsJson: string | null = null;
let cachedHospitalsGzip: Buffer | null = null;

function ensureHospitalsCache() {
  if (cachedHospitalsJson !== null && cachedHospitalsGzip !== null) {
    return;
  }
  const filePath = path.join(process.cwd(), "public", "data", "hospitals.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  let hospitals = JSON.parse(fileContents);
  if (Array.isArray(hospitals) && Array.isArray(hospitals[0])) {
    hospitals = hospitals.flat();
  }
  cachedHospitals = Array.isArray(hospitals) ? hospitals : [];
  cachedHospitalsJson = JSON.stringify(cachedHospitals);
  cachedHospitalsGzip = zlib.gzipSync(Buffer.from(cachedHospitalsJson, "utf8"));
}

export async function GET(request: Request) {
  try {
    ensureHospitalsCache();
    const acceptEncoding = request.headers.get("accept-encoding") || "";

    if (acceptEncoding.includes("gzip") && cachedHospitalsGzip) {
      return new NextResponse(new Uint8Array(cachedHospitalsGzip), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Encoding": "gzip",
          "Vary": "Accept-Encoding",
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      });
    }

    return new NextResponse(cachedHospitalsJson || "[]", {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Hospitals data not found" }, { status: 404 });
  }
}
