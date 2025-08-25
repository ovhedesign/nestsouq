import { useEffect, useState, useCallback } from 'react';
import { auth } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (uid) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      const response = await fetch(`${baseUrl}/api/user-data?uid=${uid}`);
      if (response.ok) {
        const userDoc = await response.json();
        setUserData(userDoc);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        await fetchUserData(authUser.uid);
        setLoading(false);
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [fetchUserData]);

  const updateUserData = useCallback((newData) => {
    setUserData((prevData) => ({ ...prevData, ...newData }));
  }, []);

  return { user, userData, loading, updateUserData };
}