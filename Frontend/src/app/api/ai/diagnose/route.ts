import { NextRequest, NextResponse } from 'next/server';
import { analyzeClinicalCase } from '@/lib/clinical-engine';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symptoms, text, language = 'bn' } = body;
    const query = symptoms || text || '';

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Symptoms or text query is required' },
        { status: 400 }
      );
    }

    const clinicalResult = analyzeClinicalCase(query, language);

    return NextResponse.json({
      success: true,
      analysis: clinicalResult,
    });
  } catch (error: any) {
    console.error('[Oxpecker AI] Diagnosis Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal clinical analysis error' },
      { status: 500 }
    );
  }
}
