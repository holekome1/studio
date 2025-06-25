
'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserRole = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: userData.role || 'manajer', // Default to most restrictive role if not found
        });
      } else {
        // Handle case where user exists in Auth but not in Firestore users collection
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: 'manajer', // Assign a default restrictive role
        });
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
      setUser(null); // Logout user if role fetch fails
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setIsLoading(true);
        fetchUserRole(firebaseUser);
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [fetchUserRole]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [router]);

  // This effect handles redirecting unauthenticated users
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/login') {
      router.replace('/login');
    }
  }, [pathname, router, user, isLoading]);


  return { user, logout, isLoading };
}
