import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

let cachedHospitals: any[] | null = null;

export async function GET() {
  try {
    if (!cachedHospitals) {
      const filePath = path.join(process.cwd(), 'public', 'data', 'hospitals.json');
      const fileContents = fs.readFileSync(filePath, 'utf8');
      let hospitals = JSON.parse(fileContents);
      // If it's a nested array due to double brackets, flatten it
      if (Array.isArray(hospitals) && Array.isArray(hospitals[0])) {
        hospitals = hospitals.flat();
      }
      cachedHospitals = Array.isArray(hospitals) ? hospitals : [];
    }
    return NextResponse.json(cachedHospitals, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Hospitals data not found" }, { status: 404 });
  }
}
