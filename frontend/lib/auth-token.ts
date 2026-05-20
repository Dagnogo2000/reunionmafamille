import type { AppRole } from './roles';

const SECRET = process.env.SESSION_SECRET || 'mafamille-dev-secret-change-in-production';

export interface TokenPayload {
  userId: number;
  role: AppRole;
}

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes.buffer;
}

async function getKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function signToken(payload: TokenPayload): Promise<string> {
  const key = await getKey();
  const data = `${payload.userId}:${payload.role}`;
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${toHex(sig)}`;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  const lastDot = token.lastIndexOf('.');
  if (lastDot < 0) return null;
  const data = token.slice(0, lastDot);
  const sigHex = token.slice(lastDot + 1);
  const colon = data.indexOf(':');
  if (colon < 0) return null;
  const userId = parseInt(data.slice(0, colon), 10);
  const role = data.slice(colon + 1) as AppRole;
  if (!userId || (role !== 'admin' && role !== 'membre')) return null;
  try {
    const key = await getKey();
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      fromHex(sigHex),
      new TextEncoder().encode(data)
    );
    return valid ? { userId, role } : null;
  } catch {
    return null;
  }
}
