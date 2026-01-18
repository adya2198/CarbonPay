import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    const data = await apiLogin(email);
    login(data.user);
    navigate("/");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="input mb-4"
            placeholder="your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="btn-primary w-full">Login</button>
        </form>
      </div>
    </main>
  );
}
