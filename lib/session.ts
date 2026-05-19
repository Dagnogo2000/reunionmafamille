import { cookies } from 'next/headers';
import { signToken, verifyToken } from './auth-token';
import type { AppRole } from './roles';

const COOKIE = 'mafamille_session';

export async function setSessionCookie(userId: number, role: AppRole) {
  const store = await cookies();
  store.set(COOKIE, await signToken({ userId, role }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSessionPayload() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionUserId(): Promise<number | null> {
  const p = await getSessionPayload();
  return p?.userId ?? null;
}
