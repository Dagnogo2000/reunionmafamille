// lib/prisma.ts
// La connexion est LAZY : elle n'est créée qu'à la première requête, pas au build.

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function cleanString(val: unknown): string {
  if (!val || val === 'undefined' || val === 'null') return '';
  return String(val).trim();
}

function cleanNeonUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace('-pooler.', '.');
  cleaned = cleaned.replace(/[\?&]channel_binding=\w+/g, '');
  return cleaned;
}

function createPrisma(): PrismaClient {
  const dbUrl =
    cleanString(process.env.POSTGRES_URL_NON_POOLING) ||
    cleanString(process.env.POSTGRES_URL) ||
    cleanString(process.env.POSTGRES_PRISMA_URL) ||
    cleanString(process.env.DATABASE_URL) ||
    '';

  if (!dbUrl) {
    throw new Error(
      'Aucune variable DATABASE_URL / POSTGRES_URL configurée — connectez une base Neon Postgres.'
    );
  }

  const { Pool } = require('@neondatabase/serverless');
  const { PrismaNeon } = require('@prisma/adapter-neon');
  const pool = new Pool({ connectionString: cleanNeonUrl(dbUrl) });
  const adapter = new PrismaNeon(pool);
  return new PrismaClient({ adapter } as any);
}

let _prismaInstance: PrismaClient | undefined;

function getPrismaClient(): PrismaClient {
  if (globalThis.prismaGlobal) return globalThis.prismaGlobal;
  if (!_prismaInstance) {
    _prismaInstance = createPrisma();
    if (process.env.NODE_ENV !== 'production') {
      globalThis.prismaGlobal = _prismaInstance;
    }
  }
  return _prismaInstance;
}

// Proxy transparent : prisma.user.findMany() etc. fonctionnent comme avant
// mais la connexion n'est ouverte qu'à la première vraie requête
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
