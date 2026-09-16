import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  return NextResponse.json(await db.getGalerie());
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const titre = String(form.get('titre') ?? '').trim();
  const file = form.get('fichier');

  if (!titre) return NextResponse.json({ error: 'Titre requis' }, { status: 400 });
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Fichier image requis' }, { status: 400 });
  }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const ext = path.extname(file.name) || '.jpg';
  const filename = `img_${Date.now()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

  return NextResponse.json(await db.addPhoto(titre, filename), { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });

  const photo = await db.deletePhoto(id);
  if (photo) {
    const filePath = path.join(UPLOAD_DIR, photo.fichier);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
  return NextResponse.json({ success: true });
}
