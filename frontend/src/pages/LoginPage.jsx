import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login as apiLogin, googleLogin as apiGoogleLogin } from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Wait for the global google object to load (from script in index.html)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!window.google || !clientId) return;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse
    });

    window.google.accounts.id.renderButton(
      document.getElementById("g_id_signin"),
      { theme: "outline", size: "large", type: "standard" }
    );

    // optionally prompt automatically
    // window.google.accounts.id.prompt();
  }, []);

  async function handleCredentialResponse(response) {
    // response.credential is the id_token
    try {
      const id_token = response.credential;
      const data = await apiGoogleLogin(id_token);
      if (data?.user) {
        login(data.user);
        navigate("/");
      } else {
        console.error("Google login failed", data);
      }
    } catch (err) {
      console.error("Google sign-in error:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const data = await apiLogin(email);
      login(data.user);
      navigate("/");
    } catch (err) {
      console.error("Email login failed", err);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>

        <div id="g_id_signin" className="mb-4"></div>

        <div className="text-center text-sm text-gray-500 mb-4">or sign in with email</div>

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
