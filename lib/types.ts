export type AppRole = 'admin' | 'membre';

export interface User {
  id: number;
  nom: string;
  email: string;
  role: AppRole;
  membre_id: number | null;
  photo?: string | null;
}

export interface Stats {
  membresActifs: number;
  reunions: number;
  cotisationsPayees: number;
  impayes: number;
  depenses: number;
  solde: number;
  cotisationMensuelle?: number;
  seuilAbsences?: number;
  alertesCount?: number;
  alertes?: Membre[];
}

export interface Membre {
  id: number;
  nom: string;
  role: string;
  actif: number;
  presences: number;
  absences: number;
  totalReunions?: number;
  statut: 'ok' | 'alerte';
  alerteAbsences?: boolean;
  messageAlerte?: string | null;
}

export interface Reunion {
  id: number;
  titre: string;
  date: string;
  pv?: string | null;
}

export interface Presence {
  membre_id: number;
  present: number;
}

export interface Cotisation {
  id: number;
  membre_id: number;
  membre_nom: string;
  montant: number;
  date_paiement: string;
  note: string | null;
}

export interface Depense {
  id: number;
  montant: number;
  description: string;
  date_depense: string;
}

export interface PhotoGalerie {
  id: number;
  titre: string;
  fichier: string;
  url: string;
  created_at?: string;
}

export interface MembreStats {
  membre: Membre;
  cotisationMensuelle: number;
  payeCeMois: number;
  resteAPayer: number;
  aJour: boolean;
  mesCotisations: Cotisation[];
}
