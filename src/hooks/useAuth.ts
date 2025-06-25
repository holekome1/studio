
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/types';

const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem('currentUser');
    if (!userJson) return null;
    return JSON.parse(userJson);
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
    return null;
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // This runs only on the client
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setUser(null);
    router.replace('/login');
  }, [router]);

  // This effect handles redirecting unauthenticated users
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router, user, isLoading]);


  return { user, logout, isLoading };
}
