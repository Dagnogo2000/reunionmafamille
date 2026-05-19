'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AppShell from '@/components/AppShell';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import type { Membre, Reunion } from '@/lib/types';

export default function ReunionsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [reunions, setReunions] = useState<Reunion[]>([]);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [presences, setPresences] = useState<Record<number, boolean>>({});
  const [showForm, setShowForm] = useState(false);
  const [newReunion, setNewReunion] = useState({ titre: '', date: '' });
  const [selectedReunion, setSelectedReunion] = useState<number | null>(null);
  const [editingPv, setEditingPv] = useState<number | null>(null);
  const [pvFile, setPvFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    const r = await api.getReunions();
    setReunions(r);
    if (isAdmin) {
      setMembres(await api.getMembres());
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    load().catch(console.error);
  }, [authLoading, isAdmin]);

  const fetchPresences = async (reunionId: number) => {
    const data = await api.getPresences(reunionId);
    const map: Record<number, boolean> = {};
    data.forEach((p) => {
      map[p.membre_id] = p.present === 1;
    });
    setPresences(map);
  };

  const handleAddReunion = async () => {
    if (!newReunion.date) {
      alert('La date est requise');
      return;
    }
    setError('');
    try {
      await api.addReunion({
        titre: newReunion.titre,
        date: newReunion.date,
      });
      setShowForm(false);
      setNewReunion({ titre: '', date: '' });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  const handlePresence = async (membreId: number, reunionId: number, present: boolean) => {
    await api.setPresence({
      membre_id: membreId,
      reunion_id: reunionId,
      present: present ? 1 : 0,
    });
    await fetchPresences(reunionId);
  };

  const handleDeleteReunion = async (id: number) => {
    if (!confirm('Supprimer cette réunion ?')) return;
    await api.deleteReunion(id);
    if (selectedReunion === id) setSelectedReunion(null);
    await load();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppShell
      title="Réunions mensuelles"
      subtitle={
        isAdmin
          ? 'Une réunion par mois — marquez les présences de chaque membre'
          : 'Calendrier des réunions de la famille (lecture seule)'
      }
    >
      {isAdmin && (
        <>
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowForm(!showForm)}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl mb-6 hover:bg-slate-800 shadow-md font-medium"
          >
            + Nouvelle réunion
          </motion.button>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl border mb-6"
            >
              <h2 className="font-bold mb-4">Planifier la réunion du mois</h2>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <motion.div className="grid md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="Titre (optionnel — généré automatiquement)"
                  className="border p-3 rounded-lg"
                  value={newReunion.titre}
                  onChange={(e) => setNewReunion({ ...newReunion, titre: e.target.value })}
                />
                <input
                  type="date"
                  required
                  className="border p-3 rounded-lg"
                  value={newReunion.date}
                  onChange={(e) => setNewReunion({ ...newReunion, date: e.target.value })}
                />
              </motion.div>
              <button
                type="button"
                onClick={handleAddReunion}
                className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 font-medium"
              >
                Créer
              </button>
            </motion.div>
          )}
        </>
      )}

      {reunions.length === 0 ? (
        <p className="text-slate-500 text-center py-12">Aucune réunion enregistrée</p>
      ) : (
        <motion.div className="space-y-5">
          {reunions.map((reunion, idx) => (
            <motion.div
              key={reunion.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-sm p-6 border"
            >
              <motion.div className="flex flex-wrap justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold">{reunion.titre}</h3>
                  <p className="text-slate-500 mt-1">
                    {new Date(reunion.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReunion(reunion.id)}
                    className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg h-fit text-sm font-medium transition-colors"
                  >
                    Supprimer
                  </button>
                )}
              </motion.div>

              <div className="mb-4">
                <h4 className="font-semibold text-slate-800 mb-2 text-sm">Procès-Verbal (PV)</h4>
                {editingPv === reunion.id ? (
                  <div className="space-y-3">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setPvFile(e.target.files?.[0] || null)}
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          if (pvFile) {
                            await api.updateReunionPv(reunion.id, pvFile);
                          }
                          setEditingPv(null);
                          setPvFile(null);
                          await load();
                        }}
                        className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800"
                      >
                        Téléverser
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPv(null);
                          setPvFile(null);
                        }}
                        className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-lg text-slate-700 text-sm border border-slate-100">
                    {reunion.pv ? (
                      <a href={reunion.pv} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-blue-600 hover:bg-blue-50 font-medium transition-colors">
                        📄 Ouvrir le document
                      </a>
                    ) : (
                      <span className="italic text-slate-400">Aucun document téléversé.</span>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPv(reunion.id);
                          setPvFile(null);
                        }}
                        className="text-slate-900 underline text-sm font-medium mt-3 block hover:text-slate-600"
                      >
                        {reunion.pv ? 'Remplacer le fichier' : 'Joindre un fichier (Word/PDF)'}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const open = selectedReunion === reunion.id ? null : reunion.id;
                      setSelectedReunion(open);
                      if (open) fetchPresences(reunion.id);
                    }}
                    className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg mb-4 text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    {selectedReunion === reunion.id ? 'Masquer' : 'Marquer les présences'}
                  </button>

                  {selectedReunion === reunion.id && (
                    <div className="border-t pt-4 space-y-2">
                      {membres.map((membre) => (
                        <label
                          key={membre.id}
                          className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer ${
                            membre.alerteAbsences ? 'bg-amber-50' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-48 font-medium">{membre.nom}</span>
                          <input
                            type="checkbox"
                            checked={presences[membre.id] || false}
                            onChange={(e) =>
                              handlePresence(membre.id, reunion.id, e.target.checked)
                            }
                          />
                          <span className="text-sm text-slate-500">Présent</span>
                        </label>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AppShell>
  );
}
