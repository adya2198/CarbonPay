// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import { useAuth } from "../context/AuthContext";
import { getWallet, getUserTrees, getTransactions } from "../services/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({ balance: 0 });
  const [trees, setTrees] = useState([]);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const w = await getWallet();
        setWallet(w);
        const t = await getUserTrees();
        setTrees(t);
        const tr = await getTransactions();
        setTxns(tr);
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl p-6 shadow flex gap-6">
            <img
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email)}`}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover"
            />

            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user?.name || user?.email}</h2>
              <p className="text-gray-500 mt-1">{user?.email}</p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Wallet</div>
                  <div className="text-xl font-bold">{loading ? "..." : `${wallet.balance} Tokens`}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Trees</div>
                  <div className="text-xl font-bold">{loading ? "..." : trees.length}</div>
                </div>

                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Transactions</div>
                  <div className="text-xl font-bold">{loading ? "..." : txns.length}</div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold">About</h4>
                <p className="text-sm text-gray-600 mt-2">This profile shows your wallet and activity on CarbonPay. You can manage trees, mint tokens and spend credits from the dashboard.</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 shadow">
              <h4 className="font-semibold mb-3">Recent Transactions</h4>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : txns.length === 0 ? (
                <p className="text-gray-500">No transactions yet.</p>
              ) : (
                <ul className="divide-y">
                  {txns.slice(0, 6).map((t) => (
                    <li key={t.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.type}</div>
                        <div className="text-xs text-gray-500">{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</div>
                      </div>
                      <div className="text-lg font-bold">{t.type === "MINT" ? <span className="text-green-600">+{t.amount}</span> : <span className="text-red-600">-{t.amount}</span>}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-white rounded-xl p-6 shadow">
              <h4 className="font-semibold mb-3">Your Trees</h4>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : trees.length === 0 ? (
                <p className="text-gray-500">You haven't submitted any trees yet.</p>
              ) : (
                <ul className="space-y-3">
                  {trees.slice(0, 6).map((t) => (
                    <li key={t.id} className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        {t.imageURL ? <img src={t.imageURL} alt="tree" className="w-full h-full object-cover" /> : <div className="flex items-center justify-center text-gray-400">No image</div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{t.count} × {t.type}</div>
                        <div className="text-sm text-gray-500">{t.location}</div>
                        <div className="text-xs text-gray-400 mt-1">{t.mintedTokens} tokens • {t.status}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
