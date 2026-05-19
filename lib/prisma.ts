// lib/prisma.ts
// Ce fichier gère la connexion à la base de données.
// - En local (dev) : SQLite via libsql (pure JS/WASM, aucune compilation native)
// - Sur Vercel (prod) : Neon PostgreSQL via @neondatabase/serverless

import { PrismaClient } from '@prisma/client';

declare global {
  // Évite de créer trop d'instances en dev (hot-reload Next.js)
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

function getPrisma(): PrismaClient {
  if (globalThis.prismaGlobal) return globalThis.prismaGlobal;
  
  let _client: PrismaClient;

  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || '';
  const isPostgres = dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql') || dbUrl.includes('neon.tech');

  if (isPostgres) {
    // ── Mode Production : Neon PostgreSQL ──
    console.log('📡 [Prisma Client] Initialisation en mode PostgreSQL (Neon)...');
    const { neon } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const pgUrl = process.env.POSTGRES_URL || dbUrl;
    const sql = neon(pgUrl);
    const adapter = new PrismaNeon(sql as any);
    _client = new PrismaClient({ adapter } as any);
  } else {
    // ── Mode Développement : libsql (SQLite, pure WASM) ──
    console.log('💻 [Prisma Client] Initialisation en mode SQLite (libsql)...');
    const { PrismaLibSql } = require('@prisma/adapter-libsql');
    
    // Nettoyage de l'URL pour libsql
    const cleanUrl = dbUrl.startsWith('file:') ? dbUrl : 'file:./prisma/dev.db';

    const adapter = new PrismaLibSql({
      url: cleanUrl,
    });
    _client = new PrismaClient({ adapter } as any);
  }

  if (process.env.NODE_ENV !== 'production') {
    globalThis.prismaGlobal = _client;
  }
  return _client;
}

export const prisma: PrismaClient = getPrisma();
