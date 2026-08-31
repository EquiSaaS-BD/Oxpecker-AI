import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY || 'c0898b6d343e43b79f6626d8266cce61';

    let audioUrl = '';
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as Blob | null;

      if (!file) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }

      // 1. Upload raw binary to AssemblyAI /v2/upload
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        return NextResponse.json({ error: `Upload failed: ${err}` }, { status: uploadRes.status });
      }

      const uploadData = await uploadRes.json();
      audioUrl = uploadData.upload_url;
    } else {
      const body = await req.json();
      audioUrl = body.audio_url;
    }

    if (!audioUrl) {
      return NextResponse.json({ error: 'Missing audio URL or file' }, { status: 400 });
    }

    // 2. Submit transcript request with flagship universal-3-5-pro and universal-2 fallback
    const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        speech_models: ['universal-3-5-pro', 'universal-2'],
        speaker_labels: true,
        punctuate: true,
        format_text: true,
        domain: 'medical-v1',
      }),
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      return NextResponse.json({ error: `Transcription submission failed: ${err}` }, { status: submitRes.status });
    }

    const submitData = await submitRes.json();
    const transcriptId = submitData.id;

    // 3. Poll for completion
    let attempts = 0;
    while (attempts < 60) {
      await new Promise((r) => setTimeout(r, 2000));
      attempts++;

      const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
        headers: {
          Authorization: apiKey,
        },
        cache: 'no-store',
      });

      if (!pollRes.ok) continue;

      const result = await pollRes.json();
      if (result.status === 'completed') {
        return NextResponse.json({
          id: result.id,
          text: result.text,
          words: result.words,
          utterances: result.utterances,
          confidence: result.confidence,
          audio_duration: result.audio_duration,
        });
      }

      if (result.status === 'error') {
        return NextResponse.json({ error: result.error }, { status: 500 });
      }
    }

    return NextResponse.json({ error: 'Transcription timed out' }, { status: 504 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
