'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, KeyRound } from 'lucide-react';
import AppShell from '@/components/AppShell';
import LoadingSpinner from '@/components/LoadingSpinner';
import FormField from '@/components/FormField';
import { Mail, Lock, User } from 'lucide-react';
import { api } from '@/lib/api';
import type { Membre } from '@/lib/types';
import PresenceTable from '@/components/PresenceTable';

export default function MembresPage() {
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAccount, setShowAccount] = useState<number | null>(null);
  const [editing, setEditing] = useState<Membre | null>(null);
  const [form, setForm] = useState({ nom: '', role: 'Membre' });
  const [accountForm, setAccountForm] = useState({
    nom: '',
    email: '',
    password: '',
  });
  const [accountError, setAccountError] = useState('');

  const load = async () => {
    setMembres(await api.getMembres());
    setLoading(false);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const resetForm = () => {
    setForm({ nom: '', role: 'Membre' });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.nom.trim()) {
      alert('Le nom est requis');
      return;
    }
    if (editing) {
      await api.updateMembre({
        id: editing.id,
        nom: form.nom.trim(),
        role: form.role,
        actif: editing.actif,
      });
    } else {
      await api.addMembre({ nom: form.nom.trim(), role: form.role });
    }
    resetForm();
    await load();
  };

  const openAccount = (m: Membre) => {
    setShowAccount(m.id);
    setAccountForm({ nom: m.nom, email: '', password: '' });
    setAccountError('');
  };

  const handleCreateAccount = async () => {
    if (!showAccount) return;
    setAccountError('');
    try {
      await api.registerMembre({
        nom: accountForm.nom,
        email: accountForm.email,
        password: accountForm.password,
        membre_id: showAccount,
      });
      setShowAccount(null);
      alert('Compte créé — le membre peut se connecter.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handleExportCSV = () => {
    if (membres.length === 0) return;
    const header = "ID,Nom,Role,Présences,Absences,Statut\n";
    const csvContent = membres.map(m => 
      `${m.id},"${m.nom}","${m.role}",${m.presences},${m.absences},"${m.alerteAbsences ? 'Alerte' : 'OK'}"`
    ).join("\n");
    const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'membres_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      title="Gestion des membres"
      subtitle="Alerte automatique après 3 absences aux réunions mensuelles"
    >
      <div className="flex flex-wrap gap-4 mb-6">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={() => {
            setEditing(null);
            setForm({ nom: '', role: 'Membre' });
            setShowForm(!showForm);
          }}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 shadow-sm font-medium"
        >
          + Nouveau membre
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          onClick={handleExportCSV}
          className="bg-white border border-slate-200 text-slate-800 px-6 py-3 rounded-xl hover:bg-slate-50 shadow-sm font-medium"
        >
          Exporter (CSV)
        </motion.button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border mb-6 max-w-lg"
        >
          <h2 className="font-bold mb-4">{editing ? 'Modifier' : 'Ajouter'} un membre</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Nom complet"
              className="w-full border border-slate-200 p-3 rounded-xl"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
            <select
              className="w-full border border-slate-200 p-3 rounded-xl"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="Membre">Membre de la famille</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-blue-500 text-white px-5 py-2 rounded-lg"
            >
              {editing ? 'Mettre à jour' : 'Ajouter'}
            </button>
            <button type="button" onClick={resetForm} className="bg-slate-200 px-5 py-2 rounded-lg">
              Annuler
            </button>
          </div>
        </motion.div>
      )}

      {showAccount && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAccount(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
              <KeyRound size={22} className="text-indigo-600" />
              Créer un accès membre
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Le membre pourra se connecter (sans voir les finances globales).
            </p>
            {accountError && (
              <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">{accountError}</p>
            )}
            <div className="space-y-4">
              <FormField
                label="Nom affiché"
                icon={User}
                value={accountForm.nom}
                onChange={(v) => setAccountForm({ ...accountForm, nom: v })}
              />
              <FormField
                label="Email de connexion"
                type="email"
                icon={Mail}
                value={accountForm.email}
                onChange={(v) => setAccountForm({ ...accountForm, email: v })}
              />
              <FormField
                label="Mot de passe"
                type="password"
                icon={Lock}
                value={accountForm.password}
                onChange={(v) => setAccountForm({ ...accountForm, password: v })}
                minLength={6}
              />
            </div>
            <motion.div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={handleCreateAccount}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium"
              >
                Créer le compte
              </button>
              <button
                type="button"
                onClick={() => setShowAccount(null)}
                className="px-5 py-3 rounded-xl bg-slate-100"
              >
                Annuler
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <PresenceTable membres={membres} />

      <motion.div className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Présences</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Alerte</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {membres.map((m) => (
              <tr key={m.id} className={m.alerteAbsences ? 'bg-amber-50/60' : ''}>
                <td className="px-6 py-4 font-medium">{m.nom}</td>
                <td className="px-6 py-4 text-slate-600">
                  {m.presences} / {m.totalReunions ?? 0}
                </td>
                <td className="px-6 py-4">
                  {m.alerteAbsences ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 text-sm font-medium">
                      <AlertTriangle size={14} />
                      3+ absences
                    </span>
                  ) : (
                    <span className="text-green-600 text-sm">OK</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-3 text-sm">
                  <button
                    type="button"
                    onClick={() => openAccount(m)}
                    className="text-indigo-600 hover:underline"
                  >
                    Compte
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(m);
                      setForm({ nom: m.nom, role: m.role });
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Supprimer ?')) {
                        await api.deleteMembre(m.id);
                        await load();
                      }
                    }}
                    className="text-red-500 hover:underline"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    </AppShell>
  );
}
