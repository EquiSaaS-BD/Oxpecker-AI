import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decryptDocumentText, getMedicalDocumentUserId } from '@/lib/medical-document-server';

export async function GET(request: Request) {
  const ownerId = await getMedicalDocumentUserId(request);
  if (!ownerId) return NextResponse.json({ error: 'Sign in to view saved medical documents.' }, { status: 401 });

  const documents = await prisma.medicalDocument.findMany({
    where: { ownerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      kind: true,
      originalName: true,
      mimeType: true,
      provider: true,
      category: true,
      analysis: true,
      priceComparison: true,
      priceSnapshot: true,
      consentAt: true,
      createdAt: true,
    },
  });

  try {
    return NextResponse.json({ documents: documents.map((document) => ({
      ...document,
      analysis: decryptDocumentText(document.analysis),
      medicineComparisons: document.priceComparison ? JSON.parse(decryptDocumentText(document.priceComparison)) : null,
      priceSnapshot: document.priceSnapshot ? JSON.parse(document.priceSnapshot) : null,
    })) });
  } catch {
    return NextResponse.json({ error: 'Medical document decryption is unavailable. Check the configured encryption key.' }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  const ownerId = await getMedicalDocumentUserId(request);
  if (!ownerId) return NextResponse.json({ error: 'Sign in to delete saved medical documents.' }, { status: 401 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Document id is required.' }, { status: 400 });

  const deleted = await prisma.medicalDocument.deleteMany({ where: { id, ownerId } });
  if (!deleted.count) return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
