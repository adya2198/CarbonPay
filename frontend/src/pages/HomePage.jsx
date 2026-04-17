// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { getWallet as apiGetWallet, getTransactions as apiGetTransactions, getUserTrees as apiGetUserTrees } from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(null);
  const [txns, setTxns] = useState([]);
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadAll() {
      setLoading(true);
      setError(null);

      try {
        if (!user || !user.uid) {
          // If no user, show fallback and stop
          throw new Error("Not authenticated. Please login.");
        }

        // fetch in parallel
        const [w, t, tr] = await Promise.allSettled([
          apiGetWallet(),
          apiGetTransactions(),
          apiGetUserTrees(),
        ]);

        // *** DEBUG LOGS (remove in production) ***
        console.log("HomePage load results:", { wallet: w, transactions: t, trees: tr });

        // wallet
        if (w.status === "fulfilled") {
          // normalize to number
          const raw = w.value;
          const n = (raw && typeof raw.balance === "number") ? raw.balance : Number(raw?.balance) || 0;
          if (mounted) setBalance(n);
        } else {
          console.warn("Wallet fetch failed:", w.reason);
          if (mounted) setBalance(0);
        }

        // transactions
        if (t.status === "fulfilled") {
          if (Array.isArray(t.value)) {
            if (mounted) setTxns(t.value);
          } else {
            console.warn("Transactions returned non-array:", t.value);
            if (mounted) setTxns([]);
          }
        } else {
          console.warn("Transactions fetch failed:", t.reason);
          if (mounted) setTxns([]);
        }

        // trees
        if (tr.status === "fulfilled") {
          if (Array.isArray(tr.value)) {
            if (mounted) setTrees(tr.value);
          } else {
            console.warn("Trees returned non-array:", tr.value);
            if (mounted) setTrees([]);
          }
        } else {
          console.warn("Trees fetch failed:", tr.reason);
          if (mounted) setTrees([]);
        }
      } catch (err) {
        console.error("HomePage loadAll error:", err);
        if (mounted) {
          setError(err.message || "Failed to load data");
          setBalance(0);
          setTxns([]);
          setTrees([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAll();
    return () => (mounted = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <NavBar />
      <main className="home-root">
        <section className="home-hero">
          <div className="hero-content">
            <h1 className="hero-title">Welcome back, {user?.name || user?.email}</h1>
            <p className="hero-subtitle">Manage your carbon credits and track your environmental impact.</p>

            <div className="hero-actions">
              <button onClick={() => navigate("/add-tree")} className="btn-action btn-primary">
                🌱 Plant Tree & Mint
              </button>

              <button onClick={() => navigate("/transfer")} className="btn-action btn-secondary">
                ↔️ Transfer Tokens
              </button>

              <button onClick={() => navigate("/my-trees")} className="btn-action btn-ghost">
                📋 My Trees
              </button>
            </div>

            {error && <div className="error-banner">⚠️ Error: {error}</div>}
          </div>

          <div className="hero-visual" aria-hidden>
            <div className="hero-shape hero-shape-1" />
            <div className="hero-shape hero-shape-2" />
          </div>
        </section>

        <section className="home-stats">
          <article className="stat-card balance-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">Wallet Balance</p>
              <div className="stat-value">
                {loading ? <span className="skeleton">...</span> : `${(typeof balance === "number" ? balance : Number(balance) || 0)} Tokens`}
              </div>
              <p className="stat-note">Your available carbon credits</p>
            </div>
            <button onClick={() => navigate("/add-tree")} className="stat-action">Mint More</button>
          </article>

          <article className="stat-card trees-card">
            <div className="stat-icon">🌲</div>
            <div className="stat-content">
              <p className="stat-label">Trees Registered</p>
              <div className="stat-value">
                {loading ? <span className="skeleton">...</span> : (Array.isArray(trees) ? trees.length : 0)}
              </div>
              <p className="stat-note">Total trees you've added</p>
            </div>
            <button onClick={() => navigate("/my-trees")} className="stat-action">View All</button>
          </article>

          <article className="stat-card activity-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <p className="stat-label">Recent Activity</p>
              <div className="stat-value">
                {loading ? <span className="skeleton">...</span> : (Array.isArray(txns) ? txns.length : 0)}
              </div>
              <p className="stat-note">Total transactions</p>
            </div>
            <button onClick={() => navigate("/transactions")} className="stat-action">See All</button>
          </article>
        </section>

        <section className="home-transactions">
          <div className="transactions-header">
            <div>
              <h2 className="transactions-title">💳 Recent Activity</h2>
              <p className="transactions-subtitle">Your latest transactions</p>
            </div>
            <button onClick={() => navigate("/transactions")} className="btn-view-all">View All →</button>
          </div>

          {loading ? (
            <div className="tx-loading">
              <div className="spinner"></div>
              <p>Loading transactions...</p>
            </div>
          ) : txns.length === 0 ? (
            <div className="tx-empty">
              <div className="empty-icon">📭</div>
              <p>No transactions yet. Start by minting your first tree!</p>
            </div>
          ) : (
            <div className="transactions-list">
              {txns.slice(0, 5).map((t) => (
                <div key={t.id} className="transaction-item">
                  <div className="tx-left">
                    <div className="tx-icon">
                      {t.type === "MINT" && "🌱"}
                      {t.type === "RECEIVE" && "⬇️"}
                      {t.type === "SEND" && "⬆️"}
                      {!["MINT", "RECEIVE", "SEND"].includes(t.type) && "🔁"}
                    </div>
                    <div>
                      <div className="tx-label">{t.type}</div>
                      <div className="tx-time">{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</div>
                    </div>
                  </div>
                  <div className={`tx-amount ${t.type === "MINT" || t.type === "RECEIVE" ? "plus" : "minus"}`}>
                    {t.type === "MINT" || t.type === "RECEIVE" ? `+${t.amount}` : `-${t.amount}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}

