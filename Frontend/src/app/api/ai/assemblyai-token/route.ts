import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const apiKey = process.env.ASSEMBLYAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Third-party AssemblyAI service is decommissioned in favor of native Web Speech API and Azure services.' },
      { status: 400 }
    );
  }

  try {
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
