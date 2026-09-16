import { prisma } from './prisma';
import { hashPassword } from './password';
import { COTISATION_MENSUELLE, SEUIL_ABSENCES_ALERTE } from './constants';
import type { AppRole } from './roles';


export function countPresenceMembre(presences: { present: number }[], totalReunions: number) {
  let p = 0;
  let a = 0;
  for (const presence of presences) {
    if (presence.present === 1) p++;
    else a++;
  }
  return { presences: p, absences: a, total: totalReunions };
}

export function enrichMembre(m: any, totalReunions: number) {
  const { presences, absences } = countPresenceMembre(m.presences || [], totalReunions);
  const alerteAbsences = absences >= SEUIL_ABSENCES_ALERTE;
  return {
    id: m.id,
    nom: m.nom,
    role: m.role,
    actif: m.actif,
    presences,
    absences,
    totalReunions,
    statut: alerteAbsences ? ('alerte' as const) : ('ok' as const),
    alerteAbsences,
    messageAlerte: alerteAbsences
      ? `Absent à ${absences} réunion${absences > 1 ? 's' : ''} — seuil de ${SEUIL_ABSENCES_ALERTE} atteint`
      : null,
  };
}

function currentMonthKey() {
  return new Date().toISOString().slice(0, 7);
}

export const db = {
  async getStats() {
    const membresActifs = await prisma.membre.findMany({ where: { actif: 1 }, include: { presences: true, cotisations: true } });
    const totalReunions = await prisma.reunion.count();
    const cotisations = await prisma.cotisation.findMany();
    const depensesDb = await prisma.depense.findMany();
    
    const cotisationsPayees = cotisations.reduce((s: number, c: any) => s + c.montant, 0);
    const depenses = depensesDb.reduce((s: number, d: any) => s + d.montant, 0);
    
    const attenduMois = membresActifs.length * COTISATION_MENSUELLE;
    const month = currentMonthKey();
    
    let payeMois = 0;
    for (const m of membresActifs) {
      const paid = m.cotisations.filter((c: any) => c.datePaiement.startsWith(month)).reduce((s: number, c: any) => s + c.montant, 0);
      payeMois += paid;
    }
    
    const impayes = Math.max(0, attenduMois - payeMois);
    const alertes = membresActifs
      .map((m: any) => enrichMembre(m, totalReunions))
      .filter((m: any) => m.alerteAbsences);
      
    return {
      membresActifs: membresActifs.length,
      reunions: totalReunions,
      cotisationsPayees,
      impayes,
      depenses,
      solde: cotisationsPayees - depenses,
      cotisationMensuelle: COTISATION_MENSUELLE,
      seuilAbsences: SEUIL_ABSENCES_ALERTE,
      alertesCount: alertes.length,
      alertes,
    };
  },

  async getStatsMembre(membreId: number) {
    const m = await prisma.membre.findUnique({ where: { id: membreId }, include: { presences: true, cotisations: true } });
    if (!m) return null;
    const totalReunions = await prisma.reunion.count();
    const enriched = enrichMembre(m, totalReunions);
    
    const month = currentMonthKey();
    const paye = m.cotisations.filter((c: any) => c.datePaiement.startsWith(month)).reduce((s: number, c: any) => s + c.montant, 0);
    const reste = Math.max(0, COTISATION_MENSUELLE - paye);
    
    const mesCotisations = m.cotisations
      .sort((a: any, b: any) => b.datePaiement.localeCompare(a.datePaiement))
      .slice(0, 6)
      .map((c: any) => ({
        id: c.id,
        membre_id: c.membreId,
        montant: c.montant,
        date_paiement: c.datePaiement,
        note: c.note,
        membre_nom: m.nom
      }));
      
    return {
      membre: enriched,
      cotisationMensuelle: COTISATION_MENSUELLE,
      payeCeMois: paye,
      resteAPayer: reste,
      aJour: reste === 0,
      mesCotisations,
    };
  },

  async getMembres() {
    const totalReunions = await prisma.reunion.count();
    const membres = await prisma.membre.findMany({ include: { presences: true } });
    return membres.map((m) => enrichMembre(m, totalReunions));
  },

  async addMembre(nom: string, role: string) {
    const m = await prisma.membre.create({ data: { nom, role, actif: 1 } });
    const totalReunions = await prisma.reunion.count();
    return enrichMembre({ ...m, presences: [] }, totalReunions);
  },

  async updateMembre(id: number, nom: string, role: string, actif: number) {
    try {
      const m = await prisma.membre.update({
        where: { id },
        data: { nom, role, actif },
        include: { presences: true }
      });
      const totalReunions = await prisma.reunion.count();
      return enrichMembre(m, totalReunions);
    } catch { return null; }
  },

  async deleteMembre(id: number) {
    await prisma.membre.delete({ where: { id } }).catch(() => {});
  },

  async getReunions() {
    return prisma.reunion.findMany();
  },

  async addReunion(titre: string, date: string) {
    const mois = date.slice(0, 7);
    const exist = await prisma.reunion.findFirst({ where: { date: { startsWith: mois } } });
    if (exist) return { error: 'Une réunion mensuelle existe déjà pour ce mois' } as const;
    
    const label = titre.trim() || `Réunion mensuelle — ${new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
    return prisma.reunion.create({ data: { titre: label, date } });
  },

  async deleteReunion(id: number) {
    await prisma.reunion.delete({ where: { id } }).catch(() => {});
  },

  async updateReunionPv(id: number, pv: string) {
    try {
      return await prisma.reunion.update({ where: { id }, data: { pv } });
    } catch { return null; }
  },

  async getPresences(reunionId: number) {
    const p = await prisma.presence.findMany({ where: { reunionId } });
    return p.map(x => ({ membre_id: x.membreId, present: x.present }));
  },

  async setPresence(membreId: number, reunionId: number, present: number) {
    await prisma.presence.upsert({
      where: { membreId_reunionId: { membreId, reunionId } },
      update: { present },
      create: { membreId, reunionId, present }
    });
  },

  async getCotisations() {
    const c = await prisma.cotisation.findMany({ include: { membre: true } });
    return c.map(x => ({
      id: x.id,
      membre_id: x.membreId,
      montant: x.montant,
      date_paiement: x.datePaiement,
      note: x.note,
      membre_nom: x.membre?.nom ?? 'Inconnu'
    }));
  },

  async addCotisation(membreId: number, montant: number, datePaiement: string, note?: string) {
    const c = await prisma.cotisation.create({
      data: { membreId, montant, datePaiement, note },
      include: { membre: true }
    });
    return {
      id: c.id,
      membre_id: c.membreId,
      montant: c.montant,
      date_paiement: c.datePaiement,
      note: c.note,
      membre_nom: c.membre?.nom ?? 'Inconnu'
    };
  },

  async deleteCotisation(id: number) {
    await prisma.cotisation.delete({ where: { id } }).catch(() => {});
  },

  async getDepenses() {
    const d = await prisma.depense.findMany();
    return d.map(x => ({
      id: x.id,
      montant: x.montant,
      description: x.description,
      date_depense: x.dateDepense
    }));
  },

  async addDepense(montant: number, description: string, dateDepense: string) {
    const d = await prisma.depense.create({ data: { montant, description, dateDepense } });
    return {
      id: d.id,
      montant: d.montant,
      description: d.description,
      date_depense: d.dateDepense
    };
  },

  async deleteDepense(id: number) {
    await prisma.depense.delete({ where: { id } }).catch(() => {});
  },

  async getGalerie() {
    const photos = await prisma.photoGalerie.findMany();
    return photos.map(p => ({
      ...p,
      created_at: p.createdAt,
      url: p.fichier.startsWith('http') ? p.fichier : `/uploads/${p.fichier}`
    }));
  },

  async addPhoto(titre: string, fichier: string) {
    const p = await prisma.photoGalerie.create({
      data: { titre, fichier, createdAt: new Date().toISOString() }
    });
    return {
      ...p,
      created_at: p.createdAt,
      url: fichier.startsWith('http') ? fichier : `/uploads/${fichier}`
    };
  },

  async deletePhoto(id: number) {
    try {
      const photo = await prisma.photoGalerie.delete({ where: { id } });
      return photo;
    } catch { return null; }
  },

  async findUserByEmail(email: string) {
    const u = await prisma.user.findFirst({ where: { email: { equals: email.toLowerCase() } } });
    if (!u) return null;
    return {
      id: u.id,
      nom: u.nom,
      email: u.email,
      password: u.password,
      role: u.role as AppRole,
      membre_id: u.membreId,
      photo: u.photo
    };
  },

  async createUser(nom: string, email: string, password: string, role: AppRole = 'membre', membreId: number | null = null) {
    const exist = await prisma.user.findFirst({ where: { email: { equals: email.toLowerCase() } } });
    if (exist) return { error: 'Cet email est déjà utilisé' } as const;
    
    if (role === 'membre' && membreId) {
      const hasAccount = await prisma.user.findFirst({ where: { membreId } });
      if (hasAccount) return { error: 'Ce membre a déjà un compte' } as const;
    }
    
    const u = await prisma.user.create({
      data: {
        nom,
        email: email.toLowerCase(),
        password: hashPassword(password),
        role,
        membreId: role === 'admin' ? null : membreId
      }
    });
    
    return {
      user: {
        id: u.id,
        nom: u.nom,
        email: u.email,
        role: u.role as AppRole,
        membre_id: u.membreId,
        photo: u.photo
      }
    };
  },

  async findUserById(id: number) {
    const u = await prisma.user.findUnique({ where: { id } });
    if (!u) return null;
    return {
      id: u.id,
      nom: u.nom,
      email: u.email,
      password: u.password,
      role: u.role as AppRole,
      membre_id: u.membreId,
      photo: u.photo
    };
  },

  async updateUser(id: number, nom: string, email: string, password?: string, photoPath?: string) {
    const exist = await prisma.user.findFirst({ where: { email: { equals: email.toLowerCase() }, id: { not: id } } });
    if (exist) return { error: 'Cet email est déjà utilisé' } as const;
    
    const dataToUpdate: any = { nom, email: email.toLowerCase() };
    if (password) dataToUpdate.password = hashPassword(password);
    if (photoPath !== undefined) dataToUpdate.photo = photoPath;
    
    try {
      const u = await prisma.user.update({ where: { id }, data: dataToUpdate });
      if (u.membreId) {
        await prisma.membre.update({ where: { id: u.membreId }, data: { nom } });
      }
      return { id: u.id, nom: u.nom, email: u.email, role: u.role as AppRole, membre_id: u.membreId, photo: u.photo };
    } catch { return null; }
  }
};
