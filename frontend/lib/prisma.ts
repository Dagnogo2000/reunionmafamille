// lib/prisma.ts
// La connexion est LAZY : elle n'est créée qu'à la première requête, pas au build.

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function createPrisma(): PrismaClient {
  const cleanString = (val: any) => {
    if (!val || val === 'undefined' || val === 'null') return '';
    return String(val).trim();
  };

  const cleanNeonUrl = (url: string) => {
    if (!url) return '';
    let cleaned = url.trim();
    cleaned = cleaned.replace('-pooler.', '.');
    cleaned = cleaned.replace(/[\?&]channel_binding=\w+/g, '');
    return cleaned;
  };

  const dbUrl =
    cleanString(process.env.POSTGRES_URL_NON_POOLING) ||
    cleanString(process.env.POSTGRES_URL) ||
    cleanString(process.env.POSTGRES_PRISMA_URL) ||
    cleanString(process.env.DATABASE_URL) ||
    '';

  const isPostgres =
    dbUrl.startsWith('postgres') ||
    dbUrl.startsWith('postgresql') ||
    dbUrl.includes('neon.tech');

  if (isPostgres) {
    console.log('📡 [Prisma Client] Initialisation en mode PostgreSQL (Neon)...');
    const { Pool } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const pgUrl =
      cleanString(process.env.POSTGRES_URL_NON_POOLING) ||
      cleanString(process.env.POSTGRES_URL) ||
      dbUrl;
    const pool = new Pool({ connectionString: cleanNeonUrl(pgUrl) });
    const adapter = new PrismaNeon(pool as any);
    return new PrismaClient({ adapter } as any);
  } else {
    console.log('💻 [Prisma Client] Initialisation en mode SQLite (libsql)...');
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    const cleanUrl = dbUrl.startsWith('file:') ? dbUrl : 'file:./prisma/dev.db';
    const adapter = new PrismaLibSql({ url: cleanUrl });
    return new PrismaClient({ adapter } as any);
  }
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
