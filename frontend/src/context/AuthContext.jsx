// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";
import { login as apiLogin } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Build a minimal user object for your app
        const token = await getIdToken(fbUser, /* forceRefresh */ false);
        const appUser = {
          uid: fbUser.uid,
          name: fbUser.displayName || fbUser.email.split("@")[0],
          email: fbUser.email,
          photoURL: fbUser.photoURL || null,
          token,
        };

        // Optionally sync with your backend (lightweight)
        try {
          await apiLogin(appUser.email); // backend will set store.user for now
        } catch (err) {
          // backend sync failure is non-fatal for now
          console.warn("Backend login sync failed:", err);
        }

        setUser(appUser);
      } else {
        setUser(null);
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  // Exposed helpers
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will run and set user
      return result;
    } catch (err) {
      console.error("Firebase Google sign-in error:", err);
      throw err;
    }
  }

  async function logout() {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, initializing, signInWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
