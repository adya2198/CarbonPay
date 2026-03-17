// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/login.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);

      navigate("/"); // go to home
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-root">
      <div className="login-container">

        {/* LEFT SIDE */}
        <div className="login-left">
          <h1>🌱 CarbonPay</h1>
          <h2>Turn Trees into Currency</h2>

          <p>
            Earn tokens by planting trees and contribute to a greener planet.
          </p>

          <div className="eco-stats">
            <div>
              <span>🌳</span>
              <strong>12,000+</strong>
              <p>Trees planted</p>
            </div>
            <div>
              <span>🌍</span>
              <strong>25,000 kg</strong>
              <p>CO₂ saved</p>
            </div>
          </div>

          <div className="hero-shapes">
            <div className="shape shape1"></div>
            <div className="shape shape2"></div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <div className="login-card">

            <img
              src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExcDIxZHF5NmhhcTFpNmtrdGpnZWQ3OWFycW42YTY1Y2FveTlwb2JoayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LPFNd1AJBoYcVUExmE/giphy.gif"
              alt="eco animation"
              className="login-gif"
            />

            <h3>Welcome Back 👋</h3>
            <p className="muted">Sign in to continue</p>

            <button
              className="btn google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Continue with Google"}
            </button>

            {error && <div className="error">{error}</div>}

          </div>
        </div>

      </div>
    </main>
  );
}