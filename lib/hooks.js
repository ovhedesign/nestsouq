import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';
import { onAuthStateChanged } from 'firebase/auth';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        try {
          if (authUser.uid) {
            const response = await fetch(`/api/user-data?uid=${authUser.uid}`);
            if (response.ok) {
              const userDoc = await response.json();
              setUserData({ uid: userDoc.uid, ...userDoc });
            } else {
              setUserData(null);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserData(null);
        }
        setLoading(false);
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return { user, userData, loading };
}
