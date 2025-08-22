import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup, // <--- THIS WAS MISSING
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBWSR-VFB_CcloAYsWxGfO0HsdLgd8A6j0",
  authDomain: "nestsouq-ac828.firebaseapp.com",
  projectId: "nestsouq-ac828",
  storageBucket: "nestsouq-ac828.appspot.com",
  messagingSenderId: "995008497182",
  appId: "1:995008497182:web:ee71d7c3e03106561dd00f",
  measurementId: "G-GG3LYQ55YB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// Popup-based login
export const googleSignIn = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

export const googleSignOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
};
