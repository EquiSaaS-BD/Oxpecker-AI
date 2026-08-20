import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'hospitals.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    let hospitals = JSON.parse(fileContents);
    // If it's a nested array due to double brackets, flatten it
    if (Array.isArray(hospitals) && Array.isArray(hospitals[0])) {
      hospitals = hospitals.flat();
    }
    return NextResponse.json(hospitals);
  } catch (error) {
    return NextResponse.json({ error: "Hospitals data not found" }, { status: 404 });
  }
}
