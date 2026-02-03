// src/pages/HomePage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getWallet, mintTokens, spendTokens, getTransactions } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txns, setTxns] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    async function loadAll() {
      try {
        const w = await getWallet();
        setBalance(w.balance ?? 0);
        const list = await getTransactions();
        setTxns(list);
      } catch (e) {
        console.error("Load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMint(amount = 5) {
    try {
      const updated = await mintTokens(amount);
      setBalance(updated);
      const list = await getTransactions();
      setTxns(list);
    } catch (err) {
      alert(err.message || "Mint failed");
    }
  }

  async function handleSpend(amount = 5) {
    try {
      const updated = await spendTokens(amount);
      setBalance(updated);
      const list = await getTransactions();
      setTxns(list);
    } catch (err) {
      alert(err.message || "Spend failed");
    }
  }

  if (loading || balance === null) {
    return (
      <div className="flex h-screen justify-center items-center">
        <p className="text-lg">Loading wallet...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}`}
            alt="Profile"
            className="w-14 h-14 rounded-full shadow"
          />
          <div>
            <h2 className="text-xl font-bold">{user.name || user.email}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="bg-blue-100 p-4 rounded-lg mb-6 text-center">
          <h3 className="text-lg font-semibold">Wallet Balance</h3>
          <p className="text-3xl font-bold text-blue-700">{balance} Tokens</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button onClick={() => handleMint(5)} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg">Mint +5</button>
          <button onClick={() => handleSpend(5)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg">Spend -5</button>
          <button onClick={() => navigate("/transactions")} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">View Transactions</button>
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Recent Transactions</h4>
          {txns.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <ul className="space-y-2">
              {txns.map((t) => (
                <li key={t.id} className="flex justify-between bg-gray-50 p-3 rounded-md">
                  <div>
                    <div className="font-semibold">{t.type}</div>
                    <div className="text-sm text-gray-500">{new Date(t.timestamp).toLocaleString()}</div>
                  </div>
                  <div className={`text-lg font-bold ${t.type === "MINT" ? "text-green-600" : "text-red-600"}`}>
                    {t.type === "MINT" ? `+${t.amount}` : `-${t.amount}`}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={logout} className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg">Logout</button>
      </div>
    </main>
  );
}
