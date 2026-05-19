'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppShell from '@/components/AppShell';
import StatsGrid from '@/components/StatsGrid';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api, formatFcfa } from '@/lib/api';
import type { Cotisation, Depense, Membre, Stats } from '@/lib/types';
import { COTISATION_MENSUELLE } from '@/lib/constants';

export default function CotisationsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [cotisations, setCotisations] = useState<Cotisation[]>([]);
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPay, setShowPay] = useState(false);
  const [showDep, setShowDep] = useState(false);
  const [payForm, setPayForm] = useState({
    membre_id: '',
    montant: String(COTISATION_MENSUELLE),
    date_paiement: new Date().toISOString().slice(0, 10),
    note: '',
  });
  const [depForm, setDepForm] = useState({
    montant: '',
    description: '',
    date_depense: new Date().toISOString().slice(0, 10),
  });

  const load = async () => {
    const [s, m, c, d] = await Promise.all([
      api.getStats(),
      api.getMembres(),
      api.getCotisations(),
      api.getDepenses(),
    ]);
    if (!('mode' in s)) setStats(s);
    setMembres(m);
    setCotisations(c);
    setDepenses(d);
    setLoading(false);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleAddCotisation = async () => {
    const membreId = parseInt(payForm.membre_id, 10);
    const montant = parseInt(payForm.montant, 10);
    if (!membreId || !montant) {
      alert('Membre et montant requis');
      return;
    }
    await api.addCotisation({
      membre_id: membreId,
      montant,
      date_paiement: payForm.date_paiement,
      note: payForm.note,
    });
    setPayForm({
      membre_id: '',
      montant: '',
      date_paiement: new Date().toISOString().slice(0, 10),
      note: '',
    });
    setShowPay(false);
    await load();
  };

  const handleAddDepense = async () => {
    const montant = parseInt(depForm.montant, 10);
    if (!montant || !depForm.description.trim()) {
      alert('Montant et description requis');
      return;
    }
    await api.addDepense({
      montant,
      description: depForm.description,
      date_depense: depForm.date_depense,
    });
    setDepForm({
      montant: '',
      description: '',
      date_depense: new Date().toISOString().slice(0, 10),
    });
    setShowDep(false);
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppShell
      title="Cotisations & finances"
      subtitle={`${formatFcfa(COTISATION_MENSUELLE)} par membre et par réunion mensuelle`}
    >
      {stats && <StatsGrid stats={stats} />}

      <div className="flex flex-wrap gap-3 mb-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowPay(!showPay)}
          className="bg-emerald-500 text-white px-5 py-2.5 rounded-lg hover:bg-emerald-600"
        >
          + Paiement
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowDep(!showDep)}
          className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600"
        >
          + Dépense
        </motion.button>
      </div>

      {showPay && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-xl border mb-6 grid md:grid-cols-2 gap-4"
        >
          <select
            className="border p-3 rounded-lg"
            value={payForm.membre_id}
            onChange={(e) => setPayForm({ ...payForm, membre_id: e.target.value })}
          >
            <option value="">Choisir un membre</option>
            {membres.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nom}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Montant (F)"
            className="border p-3 rounded-lg"
            value={payForm.montant}
            onChange={(e) => setPayForm({ ...payForm, montant: e.target.value })}
          />
          <input
            type="date"
            className="border p-3 rounded-lg"
            value={payForm.date_paiement}
            onChange={(e) => setPayForm({ ...payForm, date_paiement: e.target.value })}
          />
          <input
            type="text"
            placeholder="Note (optionnel)"
            className="border p-3 rounded-lg"
            value={payForm.note}
            onChange={(e) => setPayForm({ ...payForm, note: e.target.value })}
          />
          <button
            type="button"
            onClick={handleAddCotisation}
            className="md:col-span-2 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Enregistrer le paiement
          </button>
        </motion.div>
      )}

      {showDep && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-xl border mb-6 grid md:grid-cols-2 gap-4"
        >
          <input
            type="number"
            placeholder="Montant (F)"
            className="border p-3 rounded-lg"
            value={depForm.montant}
            onChange={(e) => setDepForm({ ...depForm, montant: e.target.value })}
          />
          <input
            type="date"
            className="border p-3 rounded-lg"
            value={depForm.date_depense}
            onChange={(e) => setDepForm({ ...depForm, date_depense: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-3 rounded-lg md:col-span-2"
            value={depForm.description}
            onChange={(e) => setDepForm({ ...depForm, description: e.target.value })}
          />
          <button
            type="button"
            onClick={handleAddDepense}
            className="md:col-span-2 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600"
          >
            Enregistrer la dépense
          </button>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.section
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <h2 className="px-6 py-4 font-semibold border-b bg-emerald-50 text-emerald-800">
            Paiements reçus
          </h2>
          <ul className="divide-y max-h-96 overflow-y-auto">
            {cotisations.length === 0 ? (
              <li className="p-6 text-slate-500 text-center">Aucun paiement</li>
            ) : (
              cotisations.map((c) => (
                <li key={c.id} className="px-6 py-4 flex justify-between items-start gap-2">
                  <motion.div layout>
                    <p className="font-medium text-slate-800">{c.membre_nom}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(c.date_paiement).toLocaleDateString('fr-FR')}
                      {c.note ? ` — ${c.note}` : ''}
                    </p>
                  </motion.div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-600">{formatFcfa(c.montant)}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('Supprimer ce paiement ?')) {
                          await api.deleteCotisation(c.id);
                          await load();
                        }
                      }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <h2 className="px-6 py-4 font-semibold border-b bg-orange-50 text-orange-800">
            Dépenses
          </h2>
          <ul className="divide-y max-h-96 overflow-y-auto">
            {depenses.length === 0 ? (
              <li className="p-6 text-slate-500 text-center">Aucune dépense</li>
            ) : (
              depenses.map((d) => (
                <li key={d.id} className="px-6 py-4 flex justify-between items-start gap-2">
                  <motion.div layout>
                    <p className="font-medium text-slate-800">{d.description}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(d.date_depense).toLocaleDateString('fr-FR')}
                    </p>
                  </motion.div>
                  <motion.div className="flex items-center gap-3">
                    <span className="font-bold text-orange-600">{formatFcfa(d.montant)}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (confirm('Supprimer cette dépense ?')) {
                          await api.deleteDepense(d.id);
                          await load();
                        }
                      }}
                      className="text-red-400 hover:text-red-600 text-sm"
                    >
                      ✕
                    </button>
                  </motion.div>
                </li>
              ))
            )}
          </ul>
        </motion.section>
      </div>
    </AppShell>
  );
}
