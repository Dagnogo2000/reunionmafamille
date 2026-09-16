import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';
import { uploadFile } from '@/lib/storage';

export async function GET() {
  return NextResponse.json(await db.getReunions());
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }
  const body = await req.json();
  const titre = String(body.titre ?? '').trim();
  const date = String(body.date ?? '').trim();
  if (!date) {
    return NextResponse.json({ error: 'Date requise' }, { status: 400 });
  }
  const result = await db.addReunion(titre, date);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json(result, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  await db.deleteReunion(id);
  return NextResponse.json({ success: true });
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }
  
  let id: number;
  let pvPath: string = '';

  try {
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      id = Number(form.get('id'));
      const file = form.get('file');

      if (file && file instanceof File && file.size > 0) {
        pvPath = await uploadFile(file, `pv_${id}`);
      } else {
        pvPath = String(form.get('pv') ?? '');
      }
    } else {
      const body = await req.json();
      id = Number(body.id);
      pvPath = String(body.pv ?? '');
    }
  } catch (err) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }

  if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  const result = await db.updateReunionPv(id, pvPath);
  if (!result) return NextResponse.json({ error: 'Réunion introuvable' }, { status: 404 });
  return NextResponse.json(result);
}
