// src/pages/TransferPage.jsx
import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { transferTokens } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function TransferPage() {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const navigate = useNavigate();

  function validate() {
    if (!email || !amount) return "Enter receiver email and amount";
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) return "Enter a positive amount";
    if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (v) return setMsg({ type: "error", text: v });

    setLoading(true);
    setMsg(null);
    try {
      await transferTokens(email.trim(), Number(amount));
      setMsg({ type: "success", text: "Transfer successful" });
      // optional: redirect to transactions or refresh wallet
      navigate("/transactions");
    } catch (err) {
      console.error("Transfer failed:", err);
      setMsg({ type: "error", text: err.message || "Transfer failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="page-root" style={{ padding: 28 }}>
        <div className="card" style={{ maxWidth: 680 }}>
          <h2>Send Tokens</h2>
          <p className="muted">Send carbon credits to another user by email</p>

          <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
            <label>Receiver Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="friend@example.com" />

            <label>Amount</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Number of tokens" />

            <div style={{ marginTop: 12 }}>
              <button disabled={loading} type="submit">{loading ? "Sending..." : "Send"}</button>
              <button onClick={() => navigate("/")} type="button" style={{ marginLeft: 10 }}>Cancel</button>
            </div>

            {msg && (
              <div style={{ marginTop: 12, color: msg.type === "error" ? "#ff6b6b" : "#6ee7b7" }}>
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}
