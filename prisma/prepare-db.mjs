import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('❌ schema.prisma introuvable !');
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');

const maskUrl = (url) => {
  if (!url) return 'undefined/empty';
  if (url === 'undefined' || url === 'null') return `literal string "${url}"`;
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.username}:***@${parsed.host}${parsed.pathname}`;
  } catch {
    return url.substring(0, 25) + '...';
  }
};

console.log('🔍 [Debug Build Env] DATABASE_URL:', maskUrl(process.env.DATABASE_URL));
console.log('🔍 [Debug Build Env] POSTGRES_PRISMA_URL:', maskUrl(process.env.POSTGRES_PRISMA_URL));
console.log('🔍 [Debug Build Env] POSTGRES_URL:', maskUrl(process.env.POSTGRES_URL));
console.log('🔍 [Debug Build Env] POSTGRES_URL_NON_POOLING:', maskUrl(process.env.POSTGRES_URL_NON_POOLING));

const cleanString = (val) => {
  if (!val || val === 'undefined' || val === 'null') return '';
  return val.trim();
};

const dbUrl = cleanString(process.env.POSTGRES_URL_NON_POOLING) || 
              cleanString(process.env.POSTGRES_URL) || 
              cleanString(process.env.POSTGRES_PRISMA_URL) || 
              cleanString(process.env.DATABASE_URL) || '';

const isPostgres = dbUrl.startsWith('postgres') || dbUrl.startsWith('postgresql') || dbUrl.includes('neon.tech');

if (isPostgres) {
  console.log('📡 [Prisma Config] Détection de PostgreSQL (Vercel Production)...');
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  
  // Écrire DATABASE_URL dans le fichier .env pour que Prisma CLI la trouve
  const pgUrl = cleanString(process.env.POSTGRES_URL_NON_POOLING) || 
                cleanString(process.env.POSTGRES_URL) || 
                cleanString(process.env.POSTGRES_PRISMA_URL) || dbUrl;
  fs.writeFileSync(path.join(process.cwd(), '.env'), `DATABASE_URL="${pgUrl}"\n`, 'utf8');
  console.log('📝 Fichier .env généré pour Prisma en production.');
} else {
  console.log('💻 [Prisma Config] Détection de SQLite (Local Dev)...');
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('✅ schema.prisma configuré avec succès !');
