'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { Membre } from '@/lib/types';
import { SEUIL_ABSENCES_ALERTE } from '@/lib/constants';

export default function PresenceTable({
  membres,
  showAlerts = true,
}: {
  membres: Membre[];
  showAlerts?: boolean;
}) {
  const alertes = membres.filter((m) => m.alerteAbsences);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
    >
      <div className="px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
        <h2 className="text-xl font-semibold text-slate-800">Suivi des présences</h2>
        <p className="text-slate-500 text-sm mt-1">
          Réunion mensuelle · Alerte après {SEUIL_ABSENCES_ALERTE} absences
        </p>
      </div>

      {showAlerts && alertes.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3"
        >
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={22} />
          <motion.div>
            <p className="font-semibold text-amber-900">
              {alertes.length} membre{alertes.length > 1 ? 's' : ''} en alerte
            </p>
            <ul className="text-sm text-amber-800 mt-1 space-y-0.5">
              {alertes.map((m) => (
                <li key={m.id}>
                  {m.nom} — {m.messageAlerte}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Membre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Présences</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Absences</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {membres.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                  Aucun membre
                </td>
              </tr>
            ) : (
              membres.map((membre, idx) => (
                <motion.tr
                  key={membre.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={membre.alerteAbsences ? 'bg-amber-50/50' : 'hover:bg-slate-50/80'}
                >
                  <td className="px-6 py-4 font-medium text-slate-900">{membre.nom}</td>
                  <td className="px-6 py-4 text-slate-600">
                    {membre.presences}
                    {membre.totalReunions != null && (
                      <span className="text-slate-400 text-sm"> / {membre.totalReunions}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{membre.absences}</td>
                  <td className="px-6 py-4">
                    {membre.statut === 'alerte' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full text-sm font-medium">
                        <AlertTriangle size={14} />
                        Alerte
                      </span>
                    ) : (
                      <span className="inline-flex text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-sm">
                        OK
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
