import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nom = String(body.nom ?? '').trim();
    const email = String(body.email ?? '').trim();
    const password = String(body.password ?? '');

    if (!nom || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe requis' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mot de passe : 6 caractères minimum' },
        { status: 400 }
      );
    }

    // 1. Create a Membre automatically
    const membre = await db.addMembre(nom, 'Membre');
    
    // 2. Link it to the new user account
    const result = await db.createUser(nom, email, password, 'membre', membre.id);
    
    if ('error' in result) {
      // Rollback Member creation if user creation fails
      await db.deleteMembre(membre.id);
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    
    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch (error) {
    console.error('❌ [Signup Error]:', error);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
