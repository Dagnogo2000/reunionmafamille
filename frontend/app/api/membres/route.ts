import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }
  return NextResponse.json(await db.getMembres());
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }
  const body = await req.json();
  const nom = String(body.nom ?? '').trim();
  const role = String(body.role ?? 'Membre').trim() || 'Membre';
  if (!nom) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
  return NextResponse.json(await db.addMembre(nom, role), { status: 201 });
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }
  const body = await req.json();
  const id = Number(body.id);
  const nom = String(body.nom ?? '').trim();
  const role = String(body.role ?? 'Membre').trim() || 'Membre';
  const actif = body.actif ? 1 : 0;
  if (!id || !nom) return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  const updated = await db.updateMembre(id, nom, role, actif);
  if (!updated) return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  await db.deleteMembre(id);
  return NextResponse.json({ success: true });
}
