import { NextRequest, NextResponse } from 'next/server';
import { analyzeClinicalCase } from '@/lib/clinical-engine';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, text, language = 'bn', category } = body;
    const query = symptoms || text || '';

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Symptoms or text query is required' },
        { status: 400 }
      );
    }

    // 1. Query Azure backend clinical AI model (150 diseases, 9,600 cases)
    let backendDiagnosis = null;
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://oxpecker-api.azurewebsites.net';
      const cleanUrl = backendUrl.replace(/\/+$/, '');
      const diagRes = await fetch(`${cleanUrl}/api/v1/clinical-ai/diagnose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: query, category }),
        signal: AbortSignal.timeout(10000),
      });
      if (diagRes.ok) {
        const diagData = await diagRes.json();
        if (diagData && diagData.diagnosis) {
          backendDiagnosis = diagData.diagnosis;
        }
      }
    } catch (e: any) {
      console.warn('[Oxpecker AI] Azure backend call skipped in diagnose route:', e.message || e);
    }

    // 2. Local clinical matching with category support
    const clinicalResult = analyzeClinicalCase(query, language, category);

    return NextResponse.json({
      success: true,
      analysis: clinicalResult,
      backendDiagnosis,
    });
  } catch (error: any) {
    console.error('[Oxpecker AI] Diagnosis Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal clinical analysis error' },
      { status: 500 }
    );
  }
}
