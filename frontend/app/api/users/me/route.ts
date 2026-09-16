import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireSession } from '@/lib/auth-server';
import { uploadFile } from '@/lib/storage';

export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await requireSession();
    
    let nom = '';
    let email = '';
    let password: string | undefined = undefined;
    let photoPath: string | undefined = undefined;

    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      nom = String(form.get('nom') ?? '').trim();
      email = String(form.get('email') ?? '').trim();
      const pwd = form.get('password');
      if (pwd) password = String(pwd);

      const file = form.get('photo');
      if (file && file instanceof File && file.size > 0) {
        photoPath = await uploadFile(file, `avatar_${sessionUser.id}`);
      }
    } else {
      const body = await req.json();
      nom = String(body.nom ?? '').trim();
      email = String(body.email ?? '').trim();
      if (body.password) password = String(body.password);
    }
    
    if (!nom || !email) {
      return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 });
    }
    
    if (password !== undefined && password.length > 0 && password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit faire au moins 6 caractères' }, { status: 400 });
    }
    
    const result = await db.updateUser(sessionUser.id, nom, email, password, photoPath);
    if (!result) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 409 });
    
    return NextResponse.json({ user: result });
  } catch (error) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
}
