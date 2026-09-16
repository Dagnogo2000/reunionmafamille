// Script de seed: crée le compte admin initial et des données de démo
// Exécuter avec : node prisma/seed.mjs (après prisma db push)
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { randomBytes, scryptSync } from 'crypto';

const cleanNeonUrl = (url) => {
  if (!url) return '';
  let cleaned = url.trim();
  cleaned = cleaned.replace('-pooler.', '.');
  cleaned = cleaned.replace(/[\?&]channel_binding=\w+/g, '');
  return cleaned;
};

const cleanString = (val) => {
  if (!val || val === 'undefined' || val === 'null') return '';
  return val.trim();
};

const dbUrl =
  cleanString(process.env.POSTGRES_URL_NON_POOLING) ||
  cleanString(process.env.POSTGRES_URL) ||
  cleanString(process.env.POSTGRES_PRISMA_URL) ||
  cleanString(process.env.DATABASE_URL) ||
  '';

if (!dbUrl) {
  console.error('❌ Aucune variable DATABASE_URL / POSTGRES_URL trouvée.');
  process.exit(1);
}

const pool = new Pool({ connectionString: cleanNeonUrl(dbUrl) });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('🌱 Début du seed...');

  const existing = await prisma.user.findFirst({ where: { email: 'admin@mafamille.com' } });
  if (existing) {
    console.log('ℹ️  Admin existant détecté, mise à jour du mot de passe...');
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashPassword('admin123') },
    });
    console.log('✅ Mot de passe admin mis à jour avec le bon hash scrypt !');
    return;
  }

  const m1 = await prisma.membre.create({ data: { nom: 'Kouassi Jean', role: 'Trésorier', actif: 1 } });
  const m2 = await prisma.membre.create({ data: { nom: 'Traoré Aminata', role: 'Secrétaire', actif: 1 } });
  await prisma.membre.create({ data: { nom: 'Diallo Moussa', role: 'Membre', actif: 1 } });
  await prisma.membre.create({ data: { nom: 'Koné Fatou', role: 'Membre', actif: 1 } });

  await prisma.user.create({
    data: {
      nom: 'Administrateur',
      email: 'admin@mafamille.com',
      password: hashPassword('admin123'),
      role: 'admin',
      membreId: null,
    },
  });

  await prisma.reunion.create({ data: { titre: 'Assemblée générale', date: '2026-01-15' } });
  await prisma.reunion.create({ data: { titre: 'Réunion mensuelle', date: '2026-02-20' } });

  await prisma.cotisation.createMany({
    data: [
      { membreId: m1.id, montant: 5000, datePaiement: '2026-01-10', note: 'Réunion janvier' },
      { membreId: m2.id, montant: 5000, datePaiement: '2026-01-12', note: 'Réunion janvier' },
    ],
  });

  await prisma.depense.create({
    data: { montant: 3000, description: 'Rafraîchissements réunion', dateDepense: '2026-01-15' },
  });

  console.log('✅ Seed terminé !');
  console.log('   Admin : admin@mafamille.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
