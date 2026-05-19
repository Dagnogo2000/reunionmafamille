'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CalendarDays, Wallet } from 'lucide-react';
import AppShell from '@/components/AppShell';
import StatsGrid from '@/components/StatsGrid';
import PresenceTable from '@/components/PresenceTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Membre, Stats } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      router.replace('/mon-espace');
      return;
    }
    Promise.all([api.getStats(), api.getMembres()])
      .then(([s, m]) => {
        if ('mode' in s) return;
        setStats(s);
        setMembres(m);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, isAdmin, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppShell
      title="Vue d'ensemble"
      subtitle="Gestion de l'association familiale"
    >
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
          {error}
        </div>
      )}
      {stats && <StatsGrid stats={stats} />}
      <PresenceTable membres={membres} />

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push('/reunions')}
          className="bg-slate-900 text-white p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.1)] text-left hover:bg-slate-800 transition-colors"
        >
          <div className="mb-3 text-slate-300"><CalendarDays size={32} /></div>
          <p className="font-semibold text-lg">Gérer les réunions</p>
          <p className="text-sm text-slate-400 mt-1">Planifier et marquer les présences</p>
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => router.push('/cotisations')}
          className="bg-white text-slate-900 p-6 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-slate-200 text-left hover:border-slate-300 transition-colors"
        >
          <div className="mb-3 text-slate-400"><Wallet size={32} /></div>
          <p className="font-semibold text-lg">Cotisations et dépenses</p>
          <p className="text-sm text-slate-500 mt-1">Suivi financier de l'association</p>
        </motion.button>
      </motion.div>
    </AppShell>
  );
}
