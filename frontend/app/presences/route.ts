import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const reunionId = Number(req.nextUrl.searchParams.get('reunion_id'));
  if (!reunionId) {
    return NextResponse.json({ error: 'reunion_id requis' }, { status: 400 });
  }
  return NextResponse.json(await db.getPresences(reunionId));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const membreId = Number(body.membre_id);
  const reunionId = Number(body.reunion_id);
  const present = body.present ? 1 : 0;
  if (!membreId || !reunionId) {
    return NextResponse.json({ error: 'membre_id et reunion_id requis' }, { status: 400 });
  }
  await db.setPresence(membreId, reunionId, present);
  return NextResponse.json({ success: true });
}
