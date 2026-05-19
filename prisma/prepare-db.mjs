import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.prisma introuvable !');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

const dbUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql') || dbUrl.includes('neon.tech');

if (isPostgres) {
  console.log('📡 [Prisma Config] Détection de PostgreSQL (Vercel Production)...');
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  
  // Écrire DATABASE_URL dans le fichier .env pour que Prisma CLI la trouve
  const pgUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || dbUrl;
  fs.writeFileSync(path.join(process.cwd(), '.env'), `DATABASE_URL="${pgUrl}"\n`, 'utf8');
  console.log('📝 Fichier .env généré pour Prisma en production.');
} else {
  console.log('💻 [Prisma Config] Détection de SQLite (Local Dev)...');
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ schema.prisma configuré avec succès !');
