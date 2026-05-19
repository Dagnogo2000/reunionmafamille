import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await db.getCotisations());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const membreId = Number(body.membre_id);
  const montant = Number(body.montant);
  const datePaiement = String(body.date_paiement ?? new Date().toISOString().slice(0, 10));
  const note = body.note ? String(body.note) : undefined;
  if (!membreId || !montant) {
    return NextResponse.json({ error: 'Membre et montant requis' }, { status: 400 });
  }
  return NextResponse.json(
    await db.addCotisation(membreId, montant, datePaiement, note),
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  await db.deleteCotisation(id);
  return NextResponse.json({ success: true });
}
