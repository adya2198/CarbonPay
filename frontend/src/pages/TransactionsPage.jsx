// src/pages/TransactionsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import "../styles/transactions.css";
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

  return (
    <main className="tx-page">
      <div className="tx-container">

        <div className="tx-header">
          <div>
            <h2>Transactions</h2>
            <p>All activity for your account</p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="btn-back"
          >
            Back to Home
          </button>
        </div>

        <div className="tx-filter">
          <label>Filter:</label>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="ALL">All</option>
            <option value="MINT">Mint</option>
            <option value="SEND">Send</option>
            <option value="RECEIVE">Receive</option>
          </select>

          <div className="tx-count">
            Showing <b>{filtered.length}</b> of <b>{txns.length}</b>
          </div>
        </div>

        {loading ? (
          <div className="tx-loading">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="tx-empty">No transactions yet.</div>
        ) : (
          <ul className="tx-list">
            {filtered.map((t) => (
              <li key={t.id} className="tx-item">

                <div className="tx-left">
                  <div className="tx-icon">
                    {getIcon(t.type)}
                  </div>

                  <div>
                    <div className="tx-type">{t.type}</div>
                    <div className="tx-time">
                      {t.timestamp
                        ? new Date(t.timestamp).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>

                <div
                  className={`tx-amount ${
                    t.type === "MINT" || t.type === "RECEIVE"
                      ? "plus"
                      : "minus"
                  }`}
                >
                  {t.type === "MINT" || t.type === "RECEIVE"
                    ? `+${t.amount}`
                    : `-${t.amount}`}
                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}