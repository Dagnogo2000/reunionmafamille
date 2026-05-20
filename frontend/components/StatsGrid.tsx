'use client';

import { motion } from 'framer-motion';
import {
  Users,
  Calendar,
  Wallet,
  AlertCircle,
  TrendingDown,
  Scale,
  AlertTriangle,
} from 'lucide-react';
import type { Stats } from '@/lib/types';
import { formatFcfa } from '@/lib/api';

export default function StatsGrid({ stats }: { stats: Stats }) {
  const cards = [
    { key: 'membresActifs' as const, title: 'Membres actifs', icon: Users, format: (v: number) => String(v) },
    { key: 'reunions' as const, title: 'Réunions tenues', icon: Calendar, format: (v: number) => String(v) },
    { key: 'cotisationsPayees' as const, title: 'Cotisations', icon: Wallet, format: formatFcfa },
    { key: 'impayes' as const, title: 'Impayés (mois)', icon: AlertCircle, format: formatFcfa },
    { key: 'depenses' as const, title: 'Dépenses', icon: TrendingDown, format: formatFcfa },
    { key: 'solde' as const, title: 'Solde', icon: Scale, format: formatFcfa },
  ];

  return (
    <motion.div className="space-y-4 mb-8">
      {stats.alertesCount != null && stats.alertesCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl"
        >
          <AlertTriangle className="text-slate-700" size={22} />
          <p className="text-slate-800 text-sm font-medium">
            {stats.alertesCount} membre{stats.alertesCount > 1 ? 's' : ''} absent
            {stats.alertesCount > 1 ? 's' : ''} à 3 réunions ou plus
          </p>
        </motion.div>
      )}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {cards.map((card, idx) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-white rounded-xl shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden group"
          >
            <motion.div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <card.icon size={18} className="text-slate-400" />
                <p className="text-slate-500 text-sm font-medium">{card.title}</p>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">{card.format(stats[card.key])}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
