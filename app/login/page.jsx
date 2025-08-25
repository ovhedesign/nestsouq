"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { motion } from "framer-motion";
import { googleSignIn, auth } from "@/lib/auth";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? useSearchParams() : null; // Access useSearchParams only on client-side

const handleSignIn = async () => {
  try {
    const currentUser = await googleSignIn();
    setUser(currentUser);

    await fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
      }),
    });

    const redirectUrl = searchParams ? searchParams.get("redirect") : null;
    router.push(redirectUrl || "/");
  } catch (error) {
    console.error("Sign-in failed", error);
  }
};


  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User just signed in via redirect
          const currentUser = result.user;
          setUser(currentUser);
          await fetch("/api/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
            }),
          });
          const redirectUrl = searchParams ? searchParams.get("redirect") : null;
          router.push(redirectUrl || "/"); // Redirect after sign-in
        }
      } catch (error) {
        console.error("Error during redirect result:", error);
        // Handle errors here, e.g., display an error message to the user
      }
    };

    handleRedirectResult(); // Call it when component mounts

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // This part will handle subsequent state changes, not the initial redirect
      // The API call and redirect for initial sign-in are handled by handleRedirectResult
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
      >
        <h1 className="text-3xl font-bold text-white">
          Welcome to <span className="text-amber-400">NestSouq</span>
        </h1>
        <p className="mt-2 text-gray-400">Sign in to begin analyzing your images.</p>

        <div className="mt-8">
          <button
            onClick={handleSignIn}
            className="flex items-center justify-center gap-3 w-full bg-white hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-400/20"
          >
            <FcGoogle size={24} /> Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}