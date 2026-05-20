'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Shield, User } from 'lucide-react';
import LoginBackground from '@/components/LoginBackground';
import FormField from '@/components/FormField';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';

function SignupForm() {
  const router = useRouter();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 1. Signup
      await api.signup({ nom, email, password });
      
      // 2. Redirect to login
      router.push('/login?registered=true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Rejoindre la Famille</h1>
            <p className="text-slate-500 mt-2 text-sm">Créez votre compte membre</p>
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
              label="Nom complet"
              type="text"
              icon={User}
              value={nom}
              onChange={setNom}
              placeholder="Ex: Diallo Moussa"
              required
            />

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
              autoComplete="new-password"
            />

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3.5 rounded-xl font-semibold shadow-md hover:bg-slate-800 disabled:opacity-60 transition-colors mt-2"
            >
              {loading ? (
                <span className="animate-pulse">Création en cours…</span>
              ) : (
                <>
                  <LogIn size={20} />
                  S'inscrire
                </>
              )}
            </motion.button>
          </form>

          <div className="text-center mt-6">
            <a href="/login" className="text-sm text-slate-500 hover:text-slate-700 underline underline-offset-2">
              Déjà membre ? Se connecter
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function SignupPage() {
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
        <SignupForm />
      </Suspense>
    </motion.div>
  );
}
