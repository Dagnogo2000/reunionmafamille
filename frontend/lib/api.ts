import type { MembreStats, Stats, User } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options?.headers,
    },
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Réponse serveur invalide');
    }
  }

  if (!res.ok) {
    const err = data as { error?: string } | null;
    throw new Error(err?.error || `Erreur ${res.status}`);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: { nom: string; email: string; password: string }) =>
    request<{ user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProfile: (formData: FormData) =>
    fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    }).then(async (res) => {
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
      return data as { user: User };
    }),

  registerMembre: (data: {
    nom: string;
    email: string;
    password: string;
    membre_id: number;
  }) =>
    request<{ user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  me: () => request<{ user: User }>('/auth/me'),

  getStats: () => request<Stats | ({ mode: 'membre' } & MembreStats)>('/stats'),
  
  getMembres: () => request<import('./types').Membre[]>('/membres'),
  
  addMembre: (data: { nom: string; role: string }) =>
    request<import('./types').Membre>('/membres', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  updateMembre: (data: { id: number; nom: string; role: string; actif: number }) =>
    request<import('./types').Membre>('/membres', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  deleteMembre: (id: number) =>
    request<{ success: boolean }>(`/membres/${id}`, { method: 'DELETE' }),

  getReunions: () => request<import('./types').Reunion[]>('/reunions'),
  
  addReunion: (data: { titre: string; date: string }) =>
    request<import('./types').Reunion>('/reunions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  deleteReunion: (id: number) =>
    request<{ success: boolean }>(`/reunions/${id}`, { method: 'DELETE' }),
    
  updateReunionPv: (id: number, file?: File, text?: string) => {
    const formData = new FormData();
    formData.append('id', String(id));
    if (file) {
      formData.append('file', file);
    } else if (text !== undefined) {
      formData.append('pv', text);
    }
    return fetch(`${API_BASE}/reunions`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    }).then(async (res) => {
      const responseText = await res.text();
      const data = responseText ? JSON.parse(responseText) : null;
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
      return data as import('./types').Reunion;
    });
  },

  getPresences: (reunionId: number) =>
    request<import('./types').Presence[]>(`/presences?reunion_id=${reunionId}`),
    
  setPresence: (data: { membre_id: number; reunion_id: number; present: number }) =>
    request<{ success: boolean }>('/presences', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCotisations: () => request<import('./types').Cotisation[]>('/cotisations'),
  
  addCotisation: (data: {
    membre_id: number;
    montant: number;
    date_paiement: string;
    note?: string;
  }) =>
    request<import('./types').Cotisation>('/cotisations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  deleteCotisation: (id: number) =>
    request<{ success: boolean }>(`/cotisations/${id}`, { method: 'DELETE' }),

  getDepenses: () => request<import('./types').Depense[]>('/depenses'),
  
  addDepense: (data: { montant: number; description: string; date_depense: string }) =>
    request<import('./types').Depense>('/depenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  deleteDepense: (id: number) =>
    request<{ success: boolean }>(`/depenses/${id}`, { method: 'DELETE' }),

  getGalerie: () => request<import('./types').PhotoGalerie[]>('/galerie'),
  
  uploadPhoto: (formData: FormData) =>
    fetch(`${API_BASE}/galerie`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    }).then(async (res) => {
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (!res.ok) throw new Error(data?.error || `Erreur ${res.status}`);
      return data as import('./types').PhotoGalerie;
    }),
    
  deletePhoto: (id: number) =>
    request<{ success: boolean }>(`/galerie/${id}`, { method: 'DELETE' }),
};

export function formatFcfa(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} F`;
}

export function imageUrl(path: string): string {
  if (path.startsWith('http')) return path;
  return path.startsWith('/') ? path : `/${path}`;
}