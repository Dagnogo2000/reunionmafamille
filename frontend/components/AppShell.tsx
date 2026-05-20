'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Home,
  Calendar,
  Wallet,
  Users,
  Image,
  LogOut,
  Menu,
  X,
  UserCircle,
  Shield,
} from 'lucide-react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

const adminNav = [
  { name: 'Accueil', path: '/', icon: Home },
  { name: 'Réunions', path: '/reunions', icon: Calendar },
  { name: 'Cotisations', path: '/cotisations', icon: Wallet },
  { name: 'Membres', path: '/membres', icon: Users },
  { name: 'Galerie', path: '/galerie', icon: Image },
  { name: 'Profil', path: '/profil', icon: UserCircle },
];

const membreNav = [
  { name: 'Mon espace', path: '/mon-espace', icon: UserCircle },
  { name: 'Réunions', path: '/reunions', icon: Calendar },
  { name: 'Galerie', path: '/galerie', icon: Image },
  { name: 'Profil', path: '/profil', icon: UserCircle },
];

export default function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    api.me().then(({ user: u }) => setUser(u)).catch(() => setUser(null));
  }, []);

  const navItems = user?.role === 'admin' ? adminNav : membreNav;

  const handleLogout = async () => {
    try {
      await api.logout();
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  const navigate = (path: string) => {
    setMobileOpen(false);
    router.push(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FAFAFA]"
    >
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button type="button" onClick={() => navigate(user?.role === 'admin' ? '/' : '/mon-espace')} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                <Users size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                MaFamille
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.path
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'
                  }`}
                >
                  <item.icon size={17} />
                  {item.name}
                </button>
              ))}
            </nav>

            <motion.div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <button
                  type="button"
                  onClick={() => navigate('/profil')}
                  className={`hidden sm:inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium hover:opacity-80 transition-opacity ${
                    user.role === 'admin'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {user.photo ? (
                    <img src={user.photo} alt={user.nom} className="w-5 h-5 rounded-full object-cover shadow-sm" />
                  ) : user.role === 'admin' ? (
                    <Shield size={14} />
                  ) : (
                    <UserCircle size={14} />
                  )}
                  {user.nom}
                </button>
              )}
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(true)}
                className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm font-medium px-2 py-1 transition-colors"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1 text-slate-700"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </motion.div>
          </div>
        </div>

        <AnimatePresence>
          {logoutConfirmOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setLogoutConfirmOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-[70]"
              >
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4 mx-auto text-red-500">
                  <LogOut size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 text-center mb-2">Déconnexion</h3>
                <p className="text-slate-500 text-center mb-6">
                  Êtes-vous sûr de vouloir vous déconnecter de votre espace familial ?
                </p>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setLogoutConfirmOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    type="button"
                    onClick={handleLogout}
                    className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors shadow-sm"
                  >
                    Déconnexion
                  </button>
                </div>
              </motion.div>
            </>
          )}

          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t bg-white"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left ${
                      pathname === item.path ? 'bg-blue-50 text-blue-700' : 'text-slate-600'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(title || subtitle) && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            {title && <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{title}</h1>}
            {subtitle && <p className="text-slate-500 mt-1">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </main>
    </motion.div>
  );
}
