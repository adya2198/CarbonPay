// frontend/src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  async function handleGoogleSignIn() {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      console.error("Google sign-in failed", err);
      alert("Google sign-in failed. See console for details.");
    }
  }

  async function handleEmailLogin(e) {
    e.preventDefault();
    try {
      const data = await apiLogin(email);
      // apiLogin sets backend user; frontend auth remains mock — unless you want to sign up via firebase email/password
      // Here we simply set user via backend sync; in practice prefer Firebase for real auth flows.
      navigate("/");
    } catch (err) {
      console.error("Email login failed", err);
      alert("Email login failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>

        <div className="mb-4">
          <button
            onClick={handleGoogleSignIn}
            className="btn-primary w-full py-3 flex items-center justify-center gap-3"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </div>

        {/* <div className="text-center text-sm text-gray-500 mb-4">or sign in with email</div>

        <form onSubmit={handleEmailLogin}>
          <input
            className="input mb-4"
            placeholder="your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn-secondary w-full">Login with Email</button>
        </form> */}
      </div>
    </main>
  );
}
