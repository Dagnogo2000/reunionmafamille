'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Shield } from 'lucide-react';
import LoginBackground from '@/components/LoginBackground';
import FormField from '@/components/FormField';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import { COTISATION_MENSUELLE } from '@/lib/constants';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { user } = await api.login(email, password);
      const from = searchParams.get('from');
      if (from && from !== '/login') {
        router.push(from);
      } else if (user.role === 'admin') {
        router.push('/');
      } else {
        router.push('/mon-espace');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-[420px]"
    >
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        <motion.div className="p-8 sm:p-10" layout>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center mb-8"
          >
            <div className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-slate-900 text-white mb-4">
              <Shield size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">MaFamille</h1>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 p-3.5 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100"
              >
                <Shield size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <FormField
              label="Adresse email"
              type="email"
              icon={Mail}
              value={email}
              onChange={setEmail}
              placeholder="votre@email.com"
              required
              autoComplete="email"
            />

            <FormField
              label="Mot de passe"
              type="password"
              icon={Lock}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-semibold shadow-md hover:bg-slate-800 disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? (
                <span className="animate-pulse">Connexion en cours…</span>
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <a href="/inscription" className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2">
              Nouveau dans la famille ? Créer un compte
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden"
    >
      <LoginBackground />
      <Suspense
        fallback={
          <div className="bg-white/90 rounded-3xl p-12">
            <LoadingSpinner />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </motion.div>
  );
}
