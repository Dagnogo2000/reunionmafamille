'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Save, Shield, UserCircle, Camera } from 'lucide-react';
import AppShell from '@/components/AppShell';
import FormField from '@/components/FormField';
import LoadingSpinner from '@/components/LoadingSpinner';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilPage() {
  const { user, loading: authLoading } = useAuth();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setNom(user.nom);
      setEmail(user.email);
      if (user.photo) {
        setPhotoPreview(user.photo);
      }
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('nom', nom);
      formData.append('email', email);
      if (password) formData.append('password', password);
      if (photoFile) formData.append('photo', photoFile);

      await api.updateProfile(formData);
      setSuccess('Profil mis à jour avec succès ! (Rechargement en cours...)');
      setPassword('');
      
      // Recharge la page pour que la nouvelle photo s'affiche partout dans l'AppShell
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AppShell
      title="Mon Profil"
      subtitle="Gérez vos informations personnelles et votre avatar"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-100 max-w-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-slate-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
                {photoPreview ? (
                  <img src={photoPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : user.role === 'admin' ? (
                  <Shield size={40} className="text-slate-900" />
                ) : (
                  <UserCircle size={40} className="text-slate-400" />
                )}
              </div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/50 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              >
                <Camera size={24} />
                <span className="text-[10px] font-medium mt-1 uppercase tracking-wider">Modifier</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-800">{user.nom}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mt-2 capitalize">
                {user.role === 'admin' ? <Shield size={14} /> : <UserCircle size={14} />}
                {user.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100">
                {success}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
              <FormField
                label="Nom complet"
                type="text"
                icon={User}
                value={nom}
                onChange={setNom}
                required
              />
              <FormField
                label="Adresse email"
                type="email"
                icon={Mail}
                value={email}
                onChange={setEmail}
                required
              />
            </div>

            <div className="pt-4">
              <h3 className="font-semibold text-slate-800 mb-2">Sécurité</h3>
              <p className="text-sm text-slate-500 mb-4">Laissez ce champ vide si vous ne souhaitez pas modifier votre mot de passe.</p>
              
              <FormField
                label="Nouveau mot de passe"
                type="password"
                icon={Lock}
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <motion.button
                type="submit"
                disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium shadow-sm hover:bg-slate-800 disabled:opacity-70 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                {saving ? (
                  <span className="animate-pulse">Enregistrement...</span>
                ) : (
                  <>
                    <Save size={18} />
                    Enregistrer les modifications
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </AppShell>
  );
}
