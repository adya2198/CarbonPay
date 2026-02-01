// src/pages/LoginPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";
import { loginWithGoogle } from "../services/api";

export default function LoginPage() {
  const navigate = useNavigate();

  async function signIn() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      // initialize user doc in Firestore
      await loginWithGoogle();

      // navigate after auth state updated
      navigate("/");
    } catch (error) {
      console.error("Google Sign-In failed:", error);
      alert("Google Sign-In failed. See console for details.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 card w-full max-w-md shadow-lg rounded-xl bg-white">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome to CarbonPay</h1>

        <button
          onClick={signIn}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center rounded-xl gap-3 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </button>
      </div>
    </main>
  );
}
