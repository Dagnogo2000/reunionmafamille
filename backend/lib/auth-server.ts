import { db } from './db';
import { getSessionUserId } from './session';
import type { AppRole } from './roles';

export interface SessionUser {
  id: number;
  nom: string;
  email: string;
  role: AppRole;
  membreId: number | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await db.findUserById(userId);
  if (!user) return null;
  return {
    id: user.id,
    nom: user.nom,
    email: user.email,
    role: user.role,
    membreId: user.membre_id,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireSession();
  if (user.role !== 'admin') throw new Error('FORBIDDEN');
  return user;
}
