// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userData = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          photoURL: fbUser.photoURL,
        };
        setUser(userData);
        
        // Check if user is admin
        try {
          const token = await fbUser.getIdToken();
          const res = await fetch("http://localhost:5000/api/auth/check-admin", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          setIsAdmin(data.isAdmin || false);
        } catch (err) {
          console.error("Failed to check admin status:", err);
          setIsAdmin(false);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setInitializing(false);
    });

    return () => unsub();
  }, []);

  async function logout() {
    await auth.signOut();
    setUser(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, initializing, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
