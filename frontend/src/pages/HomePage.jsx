// // src/pages/HomePage.jsx
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { getWallet, mintTokens, spendTokens, getTransactions } from "../services/api";
// import { useNavigate } from "react-router-dom";

// export default function HomePage() {
//   const { user, logout } = useAuth();
//   const [balance, setBalance] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [txns, setTxns] = useState([]);
//   const navigate = useNavigate();
  
//   useEffect(() => {
//     async function loadAll() {
//       try {
//         const w = await getWallet();
//         setBalance(w.balance ?? 0);
//         const list = await getTransactions();
//         setTxns(list);
//       } catch (e) {
//         console.error("Load error:", e);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadAll();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function handleMint(amount = 5) {
//     try {
//       const updated = await mintTokens(amount);
//       setBalance(updated);
//       const list = await getTransactions();
//       setTxns(list);
//     } catch (err) {
//       alert(err.message || "Mint failed");
//     }
//   }

//   async function handleSpend(amount = 5) {
//     try {
//       const updated = await spendTokens(amount);
//       setBalance(updated);
//       const list = await getTransactions();
//       setTxns(list);
//     } catch (err) {
//       alert(err.message || "Spend failed");
//     }
//   }

//   if (loading || balance === null) {
//     return (
//       <div className="flex h-screen justify-center items-center">
//         <p className="text-lg">Loading wallet...</p>
//       </div>
//     );
//   }

//   return (
//     <main className="min-h-screen p-6 bg-gray-100">
//       <div className="max-w-2xl mx-auto bg-white shadow-md rounded-xl p-6">
//         <div className="flex items-center gap-4 mb-6">
//           <img
//             src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}`}
//             alt="Profile"
//             className="w-14 h-14 rounded-full shadow"
//           />
//           <div>
//             <h2 className="text-xl font-bold">{user.name || user.email}</h2>
//             <p className="text-gray-600">{user.email}</p>
//           </div>
//         </div>

//         <div className="bg-blue-100 p-4 rounded-lg mb-6 text-center">
//           <h3 className="text-lg font-semibold">Wallet Balance</h3>
//           <p className="text-3xl font-bold text-blue-700">{balance} Tokens</p>
//         </div>

//         <div className="flex gap-4 mb-6">
//           <button onClick={() => handleMint(5)} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg">Mint +5</button>
//           <button onClick={() => handleSpend(5)} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg">Spend -5</button>
//           <button onClick={() => navigate("/transactions")} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">View Transactions</button>
//           <button onClick={() => navigate("/add-tree")} className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg">Add Trees</button>
//           <button onClick={() => navigate("/my-trees")} className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">My Trees</button>
//           <button onClick={() => navigate("/transactions")} className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-lg">Transactions</button>
//         </div>

//         <div className="mb-4">
//           <h4 className="font-semibold mb-2">Recent Transactions</h4>
//           {txns.length === 0 ? (
//             <p className="text-gray-500">No transactions yet</p>
//           ) : (
//             <ul className="space-y-2">
//               {txns.map((t) => (
//                 <li key={t.id} className="flex justify-between bg-gray-50 p-3 rounded-md">
//                   <div>
//                     <div className="font-semibold">{t.type}</div>
//                     <div className="text-sm text-gray-500">{new Date(t.timestamp).toLocaleString()}</div>
//                   </div>
//                   <div className={`text-lg font-bold ${t.type === "MINT" ? "text-green-600" : "text-red-600"}`}>
//                     {t.type === "MINT" ? `+${t.amount}` : `-${t.amount}`}
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>

//         <button onClick={logout} className="w-full py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg">Logout</button>
//       </div>
//     </main>
//   );
// }
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

