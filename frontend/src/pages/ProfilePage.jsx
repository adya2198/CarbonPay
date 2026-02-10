// src/pages/ProfilePage.jsx

import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import "../styles/ProfilePage.css";
import { useAuth } from "../context/AuthContext";
import { getUserTrees, getWallet, getTransactions } from "../services/api";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

export default function ProfilePage() {
  const { user } = useAuth();

  const [balance, setBalance] = useState(null);
  const [trees, setTrees] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // --------------------------------------------------
  // 🔹 Seed Demo Data (DEV PURPOSE ONLY — remove later)
  // --------------------------------------------------
  async function seedDemoData() {
    if (!user || !user.uid) {
      alert("Sign in first.");
      return;
    }

    try {
      setMessage("Adding demo data...");

      // 1) write/overwrite wallet
      await setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          balance: 150,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 2) add tree
      await addDoc(collection(db, "trees"), {
        uid: user.uid,
        count: 3,
        type: "native",
        location: "Demo Forest",
        mintedTokens: 30,
        createdAt: serverTimestamp(),
      });

      // 3) add transaction
      await addDoc(collection(db, "transactions"), {
        uid: user.uid,
        type: "MINT",
        amount: 30,
        timestamp: serverTimestamp(),
      });

      setMessage("Demo data added! Reload page.");
      alert("Demo data written — reload profile page to see changes.");
    } catch (err) {
      console.error(err);
      alert("Seed failed: " + err.message);
    }
  }

  // --------------------------------------------------
  // 🔹 Load Wallet + Trees + Transactions
  // --------------------------------------------------
  useEffect(() => {
    let mounted = true;

    async function loadData() {
      if (!user || !user.uid) return;

      try {
        setLoading(true);

        const [w, t, tr] = await Promise.allSettled([
          getWallet(),
          getTransactions(),
          getUserTrees(),
        ]);

        // Wallet
        if (w.status === "fulfilled") {
          const bal = w.value?.balance;
          setBalance(typeof bal === "number" ? bal : Number(bal) || 0);
        } else {
          setBalance(0);
        }

        // Transactions
        if (t.status === "fulfilled" && Array.isArray(t.value)) {
          setTxns(t.value);
        } else {
          setTxns([]);
        }

        // Trees
        if (tr.status === "fulfilled" && Array.isArray(tr.value)) {
          setTrees(tr.value);
        } else {
          setTrees([]);
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => (mounted = false);
  }, [user]);

  return (
    <>
      <NavBar />

      <main className="profile-root">
        <section className="profile-card">
          <img
            src={user?.photoURL || "/avatar.png"}
            alt="avatar"
            className="profile-avatar"
          />

          <div className="profile-info">
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
          </div>

          <div className="profile-stats">
            <div className="stat-box">
              <div className="stat-value">
                {loading ? "…" : `${balance} Tokens`}
              </div>
              <div className="stat-label">Tokens</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">
                {loading ? "…" : trees.length}
              </div>
              <div className="stat-label">Trees</div>
            </div>

            <div className="stat-box">
              <div className="stat-value">
                {loading ? "…" : txns.length}
              </div>
              <div className="stat-label">Txns</div>
            </div>
          </div>
        </section>

        <button onClick={seedDemoData} className="seed-btn">
          Seed Demo Data
        </button>
        {message && <p className="msg">{message}</p>}

        {/* Recent Transactions */}
        <section className="profile-section">
          <h3>Recent Transactions</h3>

          {txns.length === 0 ? (
            <p className="muted">No transactions</p>
          ) : (
            txns.slice(0, 4).map((t) => (
              <div key={t.id} className="txn-row">
                <div>{t.type}</div>
                <div className={t.type === "MINT" ? "plus" : "minus"}>
                  {t.type === "MINT" ? `+${t.amount}` : `-${t.amount}`}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Trees Section */}
        <section className="profile-section">
          <h3>Your Trees</h3>

          {trees.length === 0 ? (
            <p className="muted">No trees added</p>
          ) : (
            trees.slice(0, 4).map((t) => (
              <div key={t.id} className="tree-row">
                <div>{t.location}</div>
                <div>{t.count} trees</div>
              </div>
            ))
          )}
        </section>
      </main>
    </>
  );
}
