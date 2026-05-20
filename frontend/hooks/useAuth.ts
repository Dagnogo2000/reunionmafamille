'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return {
    user,
    loading,
    isAdmin: user?.role === 'admin',
    isMembre: user?.role === 'membre',
  };
}
