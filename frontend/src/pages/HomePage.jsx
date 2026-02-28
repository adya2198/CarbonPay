// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { getWallet as apiGetWallet, getTransactions as apiGetTransactions, getUserTrees as apiGetUserTrees } from "../services/api";
import { useNavigate } from "react-router-dom";

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
      <main className="hp-root">
        <section className="hp-hero">
          <div>
            <h1 className="hp-hi">Welcome back, {user?.name || user?.email}</h1>
            <p className="hp-sub">Manage your carbon credits, trees, and transactions.</p>

            <div className="hp-actions">
              <button onClick={() => navigate("/add-tree")} className="btn btn-primary">Add Trees & Mint</button>
              <button onClick={() => navigate("/transactions")} className="btn btn-ghost">View Transactions</button>
            </div>

            {error && <div style={{ marginTop: 12, color: "#ff8b8b", fontWeight: 600 }}>Error: {error}</div>}
          </div>

          <div className="hp-hero-visual" aria-hidden>
            <div className="hero-shape hero-shape-1" />
            <div className="hero-shape hero-shape-2" />
          </div>
        </section>

        <section className="hp-grid">
          <article className="card">
            <div className="card-head">Wallet Balance</div>
            <div className="card-body">
              <div className="card-value">
                {loading ? "..." : `${(typeof balance === "number" ? balance : Number(balance) || 0)} Tokens`}
              </div>
              <div className="card-note">Your available carbon credits</div>
            </div>
            <div className="card-foot">
              <button onClick={() => navigate("/add-tree")} className="mini">Mint</button>
            </div>
          </article>

          <article className="card">
            <div className="card-head">Trees Registered</div>
            <div className="card-body">
              <div className="card-value">{loading ? "..." : (Array.isArray(trees) ? trees.length : 0)}</div>
              <div className="card-note">Total trees you've added</div>
            </div>
            <div className="card-foot">
              <button onClick={() => navigate("/my-trees")} className="mini">My Trees</button>
            </div>
          </article>

          <article className="card wide">
            <div className="card-head">Recent Transactions</div>
            <div className="card-list">
              {loading ? (
                <div className="muted">Loading...</div>
              ) : txns.length === 0 ? (
                <div className="muted">No transactions yet</div>
              ) : (
                txns.slice(0, 6).map((t) => (
                  <div key={t.id} className="txn-row">
                    <div className="txn-left">
                      <div className="txn-type">{t.type}</div>
                      <div className="txn-time">{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</div>
                    </div>
                    <div className={`txn-amt ${t.type === "MINT" ? "plus" : "minus"}`}>
                      {t.type === "MINT" ? `+${t.amount}` : `-${t.amount}`}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="card-foot">
              <button onClick={() => navigate("/transactions")} className="mini">See all</button>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

