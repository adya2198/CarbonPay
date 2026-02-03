// src/pages/TransactionsPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
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
  const [filter, setFilter] = useState("ALL"); // ALL | MINT | SPEND

  useEffect(() => {
    if (!user?.uid) {
      setTxns([]);
      setLoading(false);
      return;
    }

    // Real-time query: user's transactions, newest first, limit to 200
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
            timestamp: data.timestamp ? data.timestamp.toMillis() : null,
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

  const filtered = txns.filter((t) => (filter === "ALL" ? true : t.type === filter));

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Transactions</h2>
            <p className="text-sm text-gray-500">All activity for your account</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Back to Home
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-600">Filter:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="ALL">All</option>
            <option value="MINT">Mint</option>
            <option value="SPEND">Spend</option>
          </select>

          <div className="ml-auto text-sm text-gray-600">
            Showing <span className="font-medium">{filtered.length}</span> of{" "}
            <span className="font-medium">{txns.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-gray-600">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-gray-500">No transactions yet.</div>
        ) : (
          <ul className="space-y-3">
            {filtered.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md shadow-sm"
              >
                <div>
                  <div className="font-semibold">{t.type}</div>
                  <div className="text-xs text-gray-500">
                    {t.timestamp ? new Date(t.timestamp).toLocaleString() : "—"}
                  </div>
                </div>

                <div className="text-lg font-bold">
                  {t.type === "MINT" ? (
                    <span className="text-green-600">+{t.amount}</span>
                  ) : (
                    <span className="text-red-600">-{t.amount}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
