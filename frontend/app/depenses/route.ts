import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  return NextResponse.json(await db.getDepenses());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const montant = Number(body.montant);
  const description = String(body.description ?? '').trim();
  const dateDepense = String(body.date_depense ?? new Date().toISOString().slice(0, 10));
  if (!montant || !description) {
    return NextResponse.json({ error: 'Montant et description requis' }, { status: 400 });
  }
  return NextResponse.json(
    await db.addDepense(montant, description, dateDepense),
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.searchParams.get('id'));
  if (!id) return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
  await db.deleteDepense(id);
  return NextResponse.json({ success: true });
}
