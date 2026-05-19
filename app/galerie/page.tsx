'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AppShell from '@/components/AppShell';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { api, imageUrl } from '@/lib/api';
import type { PhotoGalerie } from '@/lib/types';

export default function GaleriePage() {
  const { isAdmin } = useAuth();
  const [photos, setPhotos] = useState<PhotoGalerie[]>([]);
  const [loading, setLoading] = useState(true);
  const [titre, setTitre] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setPhotos(await api.getGalerie());
    setLoading(false);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !file) {
      alert('Titre et image requis');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('titre', titre.trim());
      fd.append('fichier', file);
      await api.uploadPhoto(fd);
      setTitre('');
      setFile(null);
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur upload');
    } finally {
      setUploading(false);
    }
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
      title="Galerie photos"
      subtitle={isAdmin ? 'Ajoutez et gérez les photos' : 'Souvenirs de la famille'}
    >
      {isAdmin && (
      <motion.form
        onSubmit={handleUpload}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-xl border mb-8 max-w-xl"
      >
        <h2 className="font-semibold mb-4 text-slate-800">Ajouter une photo</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Titre de la photo"
            className="w-full border p-3 rounded-lg"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="w-full text-sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <motion.button
          type="submit"
          disabled={uploading}
          whileHover={{ scale: 1.02 }}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {uploading ? 'Envoi…' : 'Téléverser'}
        </motion.button>
      </motion.form>
      )}

      {photos.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-slate-500 py-16"
        >
          Aucune photo pour le moment
        </motion.p>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {photos.map((photo) => (
            <motion.article
              key={photo.id}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1 },
              }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100"
            >
              <div className="relative aspect-video bg-slate-100">
                <Image
                  src={imageUrl(photo.url)}
                  alt={photo.titre}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <motion.div className="p-4 flex justify-between items-center">
                <h3 className="font-medium text-slate-800">{photo.titre}</h3>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm('Supprimer cette photo ?')) {
                        await api.deletePhoto(photo.id);
                        await load();
                      }
                    }}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </motion.div>
            </motion.article>
          ))}
        </motion.div>
      )}
    </AppShell>
  );
}
