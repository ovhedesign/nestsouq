"use client";

import { useState, useEffect } from "react";
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { googleSignIn, auth } from "@/lib/auth"; // Assume these are defined
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import image from "./login.png"; // replace with your image

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const t = useTranslations('Login');
  const router = useRouter();
  const searchParams = typeof window !== "undefined" ? useSearchParams() : null;

  const fetchUserAndRedirect = async (currentUser) => {
    // 1. Post user data to your API
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

    // 2. Redirect
    const redirectUrl = searchParams ? searchParams.get("redirect") : null;
    // Set loading to false before redirecting in case the redirect fails
    setLoading(false);
    router.push(redirectUrl || "/");
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const currentUser = await googleSignIn();
      if (currentUser) {
        // If sign-in completes without redirect (e.g., using a popup), process user
        await fetchUserAndRedirect(currentUser);
      }
    } catch (error) {
      console.error("Sign-in failed", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Handle redirect results (important for mobile/some browser auth flows)
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          await fetchUserAndRedirect(result.user);
        }
      } catch (error) {
        console.error("Error during redirect result:", error);
        setLoading(false);
      }
    };

    handleRedirectResult();

    // Cleanup function is correctly placed here
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // You might use this to set initial state or redirect if already logged in
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  return (
    // **Mobile-First Wrapper:** Ensures full height and centers content globally
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-950/90 [background-image:radial-gradient(ellipse_at_top,_var(--tw-color-gray-900),_var(--tw-color-gray-950))]">
      {/* Left Side Image - Hidden on mobile, shown on md screens */}
      <div className="relative w-full md:w-1/2 h-64 md:h-auto hidden md:block">
        <Image
          src={image}
          alt="NestSouq Illustration"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Right Side Login - **The Core Fix for Centering** */}
      {/* On mobile, this takes full width and height, centers the item */}
      {/* On desktop, it takes half the width and centers the item */}
      <div className="flex items-center justify-center flex-grow w-full md:w-1/2 p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          // Card Styles: Controlled width and padding
          // max-w-sm on mobile for less screen dominance, max-w-lg on desktop
          className="bg-gray-900/80 backdrop-blur-sm relative rounded-3xl shadow-[0_0_40px_rgba(251,191,36,0.1)] w-full max-w-sm sm:max-w-md md:max-w-lg p-8 sm:p-10 md:p-14 border border-gray-800"
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl p-[1px] opacity-20">
            <div className="h-full w-full rounded-3xl bg-gradient-to-br from-amber-400 to-purple-600 animate-pulse-slow"></div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white text-center">
            {t('welcomeTo')}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-yellow-200 block text-4xl sm:text-5xl mt-1">
              {t('nestSouq')}
            </span>
          </h1>
          <p className="mt-3 sm:mt-4 text-gray-400 text-center text-sm sm:text-base">
            {t('signInPrompt')}
          </p>

          <div className="mt-10 sm:mt-12">
            <motion.button
              onClick={handleSignIn}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 w-full bg-white text-gray-900 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-xl hover:shadow-amber-400/30 disabled:opacity-50 text-base sm:text-lg relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/5 transition-opacity duration-300 opacity-0 hover:opacity-100"></span>
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <FcGoogle size={26} />
              )}
              <span className="z-10">
                {loading ? t('authenticating') : t('continueWithGoogle')}
              </span>
            </motion.button>
          </div>

          {/* Terms */}
          <div className="mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              {t('termsAgreement')}
              <button
                onClick={() => setShowTerms(!showTerms)}
                className="text-amber-400 hover:text-amber-300 transition-colors duration-200 ml-1 font-medium underline-offset-4 hover:underline focus:outline-none"
              >
                {t('termsAndConditions')}
              </button>
              .
            </p>

            {showTerms && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4 text-gray-400 text-xs bg-gray-800/50 p-4 rounded-xl max-h-48 overflow-y-auto border border-gray-700/50"
              >
                <h3 className="text-white font-semibold mb-2">
                  {t('serviceAgreementSummary')}
                </h3>
                <p>
                  {t('dataUse')}
                </p>
                <p className="mt-2">
                  {t('acceptableUse')}
                </p>
                <p className="mt-2">
                  {t('disclaimer')}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
