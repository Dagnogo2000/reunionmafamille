import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-server';

/** Création de compte membre — réservée à l'administrateur */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: 'Accès réservé à l\'administrateur' }, { status: 403 });
  }

  const body = await req.json();
  const nom = String(body.nom ?? '').trim();
  const email = String(body.email ?? '').trim();
  const password = String(body.password ?? '');
  const membreId = Number(body.membre_id);

  if (!nom || !email || !password || !membreId) {
    return NextResponse.json(
      { error: 'Nom, email, mot de passe et membre associé requis' },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Mot de passe : 6 caractères minimum' },
      { status: 400 }
    );
  }

  const result = await db.createUser(nom, email, password, 'membre', membreId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }
  return NextResponse.json({ user: result.user }, { status: 201 });
}
