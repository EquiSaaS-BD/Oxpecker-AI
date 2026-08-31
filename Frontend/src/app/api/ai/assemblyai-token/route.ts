import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY || 'c0898b6d343e43b79f6626d8266cce61';

    // AssemblyAI token endpoint requires the raw key in Authorization header (no Bearer prefix)
    const response = await fetch(
      'https://streaming.assemblyai.com/v3/token?expires_in_seconds=60',
      {
        method: 'GET',
        headers: {
          Authorization: apiKey,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Failed to mint token: ${response.status} ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error while fetching AssemblyAI token' },
      { status: 500 }
    );
  }
}
