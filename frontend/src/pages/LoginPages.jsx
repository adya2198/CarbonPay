import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    login(email);          // mock login
    navigate("/");         // go to home
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Welcome to CarbonPay</h1>
        <p className="text-sm text-gray-500 mb-6">
          Sign in to manage your carbon wallet
        </p>

        <form onSubmit={handleSubmit}>
          <label className="text-xs text-gray-500">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border rounded-lg mb-4"
            placeholder="you@example.com"
          />

          <button type="submit" className="btn-primary w-full">
            Login
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-4">
          Demo login — no password required
        </p>
      </div>
    </main>
  );
}
