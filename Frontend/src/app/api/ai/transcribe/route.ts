import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    let fileBuffer: Buffer | null = null;
    let fileName = 'audio.wav';
    let fileMime = 'audio/wav';
    let audioUrl = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | Blob | null;

      if (!file) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }

      fileBuffer = Buffer.from(await file.arrayBuffer());
      if ('name' in file && file.name) fileName = file.name;
      if (file.type) fileMime = file.type;
    } else {
      const body = await req.json();
      audioUrl = body.audio_url || '';
    }

    // 1. Prioritize Azure OpenAI Whisper Service if configured
    if (fileBuffer && process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
      try {
        const rawEndpoint = process.env.AZURE_OPENAI_ENDPOINT.replace(/\/+$/, '');
        const deployment = process.env.AZURE_OPENAI_WHISPER_DEPLOYMENT || 'whisper';
        const whisperUrl = `${rawEndpoint}/openai/deployments/${deployment}/audio/transcriptions?api-version=2024-02-01`;

        const azureFormData = new FormData();
        const audioBlob = new Blob([new Uint8Array(fileBuffer)], { type: fileMime });
        azureFormData.append('file', audioBlob, fileName);
        azureFormData.append('model', 'whisper-1');

        const azureRes = await fetch(whisperUrl, {
          method: 'POST',
          headers: {
            'api-key': process.env.AZURE_OPENAI_API_KEY,
          },
          body: azureFormData,
        });

        if (azureRes.ok) {
          const azureData = await azureRes.json();
          return NextResponse.json({
            text: azureData.text,
            provider: 'azure-openai-whisper',
          });
        }
      } catch (err: any) {
        console.warn('[Oxpecker AI] Azure Whisper transcription failed:', err.message || err);
      }
    }

    // 2. Secondary fallback to AssemblyAI only if configured in environment variables (no hardcoded keys)
    const assemblyApiKey = process.env.ASSEMBLYAI_API_KEY;
    if (assemblyApiKey) {
      if (fileBuffer && !audioUrl) {
        const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
          method: 'POST',
          headers: {
            Authorization: assemblyApiKey,
            'Content-Type': 'application/octet-stream',
          },
          body: new Uint8Array(fileBuffer),
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.text();
          return NextResponse.json({ error: `Upload failed: ${err}` }, { status: uploadRes.status });
        }

        const uploadData = await uploadRes.json();
        audioUrl = uploadData.upload_url;
      }

      if (audioUrl) {
        const submitRes = await fetch('https://api.assemblyai.com/v2/transcript', {
          method: 'POST',
          headers: {
            Authorization: assemblyApiKey,
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

        if (submitRes.ok) {
          const submitData = await submitRes.json();
          const transcriptId = submitData.id;

          let attempts = 0;
          while (attempts < 60) {
            await new Promise((r) => setTimeout(r, 2000));
            attempts++;

            const pollRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
              headers: { Authorization: assemblyApiKey },
              cache: 'no-store',
            });

            if (!pollRes.ok) continue;

            const result = await pollRes.json();
            if (result.status === 'completed') {
              return NextResponse.json({
                id: result.id,
                text: result.text,
                provider: 'assemblyai',
              });
            }

            if (result.status === 'error') {
              return NextResponse.json({ error: result.error }, { status: 500 });
            }
          }
        }
      }
    }

    return NextResponse.json({
      error: 'Audio transcription requires Azure OpenAI Whisper or browser Web Speech API.',
      text: '',
    }, { status: 400 });

  } catch (error: any) {
    console.error('[Oxpecker AI] Transcribe error:', error);
    return NextResponse.json({ error: error.message || 'Internal transcription error' }, { status: 500 });
  }
}
