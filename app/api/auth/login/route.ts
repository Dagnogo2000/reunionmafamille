import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { setSessionCookie } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email ?? '').trim();
    const password = String(body.password ?? '');

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const user = await db.findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Email ou mot de passe incorrect' }, { status: 401 });
    }

    await setSessionCookie(user.id, user.role);
    return NextResponse.json({
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        membre_id: user.membre_id,
      },
    });
  } catch (error) {
    console.error('❌ [Login Error]:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
