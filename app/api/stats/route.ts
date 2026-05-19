import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth-server';

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 });
  }

  if (user.role === 'admin') {
    return NextResponse.json(await db.getStats());
  }

  if (!user.membreId) {
    return NextResponse.json({ error: 'Compte membre non lié' }, { status: 400 });
  }
  const mine = await db.getStatsMembre(user.membreId);
  if (!mine) {
    return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 });
  }
  return NextResponse.json({ mode: 'membre', ...mine });
}
