'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Calendar, CheckCircle, Wallet } from 'lucide-react';
import AppShell from '@/components/AppShell';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api, formatFcfa } from '@/lib/api';
import { COTISATION_MENSUELLE, SEUIL_ABSENCES_ALERTE } from '@/lib/constants';
import type { MembreStats } from '@/lib/types';

export default function MonEspacePage() {
  const [data, setData] = useState<MembreStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getStats()
      .then((res) => {
        if ('mode' in res && res.mode === 'membre') {
          const { mode: _, ...stats } = res;
          setData(stats as MembreStats);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <motion.div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </motion.div>
    );
  }

  if (!data) {
    return (
      <AppShell title="Mon espace">
        <p className="text-slate-500">Impossible de charger vos informations.</p>
      </AppShell>
    );
  }

  const { membre, payeCeMois, resteAPayer, aJour, mesCotisations } = data;

  return (
    <AppShell
      title={`Bonjour, ${membre.nom}`}
      subtitle={`Cotisation mensuelle : ${formatFcfa(COTISATION_MENSUELLE)} · Réunion chaque mois`}
    >
      {membre.alerteAbsences && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-5 bg-amber-50 border-2 border-amber-300 rounded-2xl flex gap-4"
        >
          <AlertTriangle className="text-amber-600 shrink-0" size={28} />
          <motion.div>
            <p className="font-bold text-amber-900 text-lg">Alerte présence</p>
            <p className="text-amber-800 mt-1">{membre.messageAlerte}</p>
            <p className="text-sm text-amber-700 mt-2">
              La famille est notifiée après {SEUIL_ABSENCES_ALERTE} absences aux réunions mensuelles.
            </p>
          </motion.div>
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <Calendar className="text-blue-500 mb-3" size={28} />
          <p className="text-slate-500 text-sm">Présences</p>
          <p className="text-3xl font-bold text-slate-800">
            {membre.presences}
            <span className="text-lg text-slate-400 font-normal"> / {membre.totalReunions ?? 0}</span>
          </p>
          <p className="text-sm text-slate-500 mt-1">{membre.absences} absence(s)</p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className={`rounded-2xl p-6 shadow-sm border ${
            aJour ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
          }`}
        >
          <Wallet className={aJour ? 'text-emerald-600' : 'text-red-500'} size={28} />
          <p className="text-slate-600 text-sm mt-3">Cotisation ce mois</p>
          <p className="text-2xl font-bold text-slate-800">{formatFcfa(payeCeMois)} payés</p>
          {!aJour && (
            <p className="text-red-600 font-medium mt-1">Reste : {formatFcfa(resteAPayer)}</p>
          )}
          {aJour && (
            <p className="flex items-center gap-1 text-emerald-700 text-sm mt-2 font-medium">
              <CheckCircle size={16} /> À jour
            </p>
          )}
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100"
        >
          <p className="text-slate-500 text-sm">Statut famille</p>
          <p
            className={`text-xl font-bold mt-2 ${
              membre.statut === 'ok' ? 'text-green-600' : 'text-amber-600'
            }`}
          >
            {membre.statut === 'ok' ? 'En règle' : 'À surveiller'}
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="font-semibold text-slate-800 mb-4">Mes derniers paiements</h2>
        {mesCotisations.length === 0 ? (
          <p className="text-slate-500 text-sm">Aucun paiement enregistré</p>
        ) : (
          <ul className="divide-y">
            {mesCotisations.map((c) => (
              <li key={c.id} className="py-3 flex justify-between">
                <span className="text-slate-600">
                  {new Date(c.date_paiement).toLocaleDateString('fr-FR')}
                  {c.note ? ` — ${c.note}` : ''}
                </span>
                <span className="font-semibold text-emerald-600">{formatFcfa(c.montant)}</span>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </AppShell>
  );
}
