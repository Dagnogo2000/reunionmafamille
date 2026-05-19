// Script de seed: crée le compte admin initial et des données de démo
// Exécuter avec : node prisma/seed.mjs (après prisma db push)
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createHash } from 'crypto';

const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });


function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Début du seed...');

  // Vérifier si l'admin existe déjà
  const existing = await prisma.user.findFirst({ where: { email: 'admin@mafamille.com' } });
  if (existing) {
    console.log('ℹ️  Admin déjà présent, seed ignoré.');
    return;
  }

  // Créer des membres de démo
  const m1 = await prisma.membre.create({ data: { nom: 'Kouassi Jean', role: 'Trésorier', actif: 1 } });
  const m2 = await prisma.membre.create({ data: { nom: 'Traoré Aminata', role: 'Secrétaire', actif: 1 } });
  const m3 = await prisma.membre.create({ data: { nom: 'Diallo Moussa', role: 'Membre', actif: 1 } });
  const m4 = await prisma.membre.create({ data: { nom: 'Koné Fatou', role: 'Membre', actif: 1 } });

  // Créer le compte Admin
  await prisma.user.create({
    data: {
      nom: 'Administrateur',
      email: 'admin@mafamille.com',
      password: hashPassword('admin123'),
      role: 'admin',
      membreId: null,
    }
  });

  // Créer deux réunions de demo
  const r1 = await prisma.reunion.create({ data: { titre: 'Assemblée générale', date: '2026-01-15' } });
  const r2 = await prisma.reunion.create({ data: { titre: 'Réunion mensuelle', date: '2026-02-20' } });

  // Cotisations de démo
  await prisma.cotisation.createMany({
    data: [
      { membreId: m1.id, montant: 5000, datePaiement: '2026-01-10', note: 'Réunion janvier' },
      { membreId: m2.id, montant: 5000, datePaiement: '2026-01-12', note: 'Réunion janvier' },
    ]
  });

  // Dépense de démo
  await prisma.depense.create({
    data: { montant: 3000, description: 'Rafraîchissements réunion', dateDepense: '2026-01-15' }
  });

  console.log('✅ Seed terminé !');
  console.log('   Admin : admin@mafamille.com / admin123');
}

main()
  .catch((e) => { console.error('❌ Erreur seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
