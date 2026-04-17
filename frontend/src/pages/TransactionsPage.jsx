// src/pages/TransactionsPage.jsx
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import "../styles/transactionsNew.css";
import {
  collection,
  query,
  where,
  orderBy,
  limit as limitTo,
  onSnapshot,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function TransactionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL | MINT | SEND | RECEIVE

  useEffect(() => {
    if (!user?.uid) {
      setTxns([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      orderBy("timestamp", "desc"),
      limitTo(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = [];
        snap.forEach((doc) => {
          const data = doc.data();

          list.push({
            id: doc.id,
            type: data.type,
            amount: data.amount,
            timestamp: data.timestamp
              ? data.timestamp.toMillis()
              : null,
          });
        });

        setTxns(list);
        setLoading(false);
      },
      (err) => {
        console.error("Transactions onSnapshot error:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  const filtered = txns.filter((t) =>
    filter === "ALL" ? true : t.type?.toUpperCase() === filter
  );

  const getIcon = (type) => {
    if (type === "MINT") return "🌱";
    if (type === "RECEIVE") return "⬇️";
    if (type === "SEND") return "⬆️";
    return "🔁";
  };

  const getTypeColor = (type) => {
    if (type === "MINT") return "mint";
    if (type === "RECEIVE") return "receive";
    if (type === "SEND") return "send";
    return "default";
  };

  const stats = {
    total: txns.length,
    mint: txns.filter((t) => t.type === "MINT").length,
    send: txns.filter((t) => t.type === "SEND").length,
    receive: txns.filter((t) => t.type === "RECEIVE").length,
  };

  return (
    <>
      <NavBar />
      <main className="txn-root">
        <div className="txn-header">
          <div>
            <h1 className="txn-title">💳 Transaction History</h1>
            <p className="txn-subtitle">Track all your account activity and token movements</p>
          </div>
          <button onClick={() => navigate("/")} className="btn-back">
            ← Back to Home
          </button>
        </div>

        <div className="txn-stats">
          <div className="stat-box total">
            <span className="stat-icon">📊</span>
            <div>
              <p>Total Transactions</p>
              <strong>{stats.total}</strong>
            </div>
          </div>
          <div className="stat-box mint">
            <span className="stat-icon">🌱</span>
            <div>
              <p>Minted</p>
              <strong>{stats.mint}</strong>
            </div>
          </div>
          <div className="stat-box receive">
            <span className="stat-icon">⬇️</span>
            <div>
              <p>Received</p>
              <strong>{stats.receive}</strong>
            </div>
          </div>
          <div className="stat-box send">
            <span className="stat-icon">⬆️</span>
            <div>
              <p>Sent</p>
              <strong>{stats.send}</strong>
            </div>
          </div>
        </div>

        <div className="txn-controls">
          <div className="filter-group">
            <label htmlFor="txn-filter">Filter by type:</label>
            <select
              id="txn-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="ALL">All Transactions</option>
              <option value="MINT">🌱 Mint</option>
              <option value="SEND">⬆️ Send</option>
              <option value="RECEIVE">⬇️ Receive</option>
            </select>
          </div>
          <div className="filter-count">
            Showing <strong>{filtered.length}</strong> of <strong>{txns.length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="txn-loading">
            <div className="spinner"></div>
            <p>Loading transactions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="txn-empty">
            <div className="empty-icon">📭</div>
            <h3>No Transactions</h3>
            <p>
              {filter === "ALL"
                ? "You haven't made any transactions yet. Start by minting your first tree!"
                : `No ${filter.toLowerCase()} transactions found.`}
            </p>
            {filter === "ALL" && (
              <button onClick={() => navigate("/add-tree")} className="btn-cta">
                Plant Your First Tree
              </button>
            )}
          </div>
        ) : (
          <div className="txn-list">
            {filtered.map((t) => (
              <div key={t.id} className={`txn-item type-${getTypeColor(t.type)}`}>
                <div className="txn-left">
                  <div className="txn-icon">{getIcon(t.type)}</div>
                  <div className="txn-details">
                    <div className="txn-type">{t.type}</div>
                    <div className="txn-date">
                      {t.timestamp
                        ? new Date(t.timestamp).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <div className={`txn-amount ${t.type === "MINT" || t.type === "RECEIVE" ? "plus" : "minus"}`}>
                  {t.type === "MINT" || t.type === "RECEIVE"
                    ? `+${t.amount}`
                    : `-${t.amount}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}