// // src/pages/MyTreesPage.jsx
// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import { getUserTrees } from "../services/api";
// import { useNavigate } from "react-router-dom";

// export default function MyTreesPage() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [trees, setTrees] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function load() {
//       if (!user) return;
//       try {
//         const list = await getUserTrees();
//         setTrees(list);
//       } catch (err) {
//         console.error("Load trees:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     load();
//     // eslint-disable-next-line
//   }, [user]);

//   return (
//     <main className="min-h-screen p-6 bg-gray-100">
//       <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-2xl font-semibold">My Trees</h2>
//           <button onClick={() => navigate("/add-tree")} className="py-2 px-3 bg-green-600 text-white rounded">Add Tree</button>
//         </div>

//         {loading ? (
//           <p>Loading...</p>
//         ) : trees.length === 0 ? (
//           <p className="text-gray-500">You haven't submitted any trees yet.</p>
//         ) : (
//           <ul className="space-y-3">
//             {trees.map((t) => (
//               <li key={t.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
//                 <div className="flex-1">
//                   <div className="font-semibold">Count: {t.count} — {t.type}</div>
//                   <div className="text-sm text-gray-500">{t.location}</div>
//                   <div className="text-sm text-gray-500">{t.status} — {t.mintedTokens} tokens</div>
//                   <div className="text-sm text-gray-400">{t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}</div>
//                 </div>
//                 {t.imageURL ? <img src={t.imageURL} alt="tree" className="w-20 h-20 object-cover rounded" /> : null}
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </main>
//   );
// }
// src/pages/MyTreesPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserTrees } from "../services/api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";

export default function MyTreesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const list = await getUserTrees();
        setTrees(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Load trees:", err);
        setTrees([]);
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function getStatusLabel(status) {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "Pending Verification";
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return "Unknown";
  }

  function getStatusClass(status) {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "pending";
    if (s === "approved") return "approved";
    if (s === "rejected") return "rejected";
    return "";
  }

  return (
    <>
      <NavBar />
      <main className="page-root" style={{ padding: 28 }}>
        <div className="card" style={{ maxWidth: 900 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold">My Trees</h2>
              <p className="muted">Track your submitted trees and their verification status.</p>
            </div>

            <button
              onClick={() => navigate("/add-tree")}
              className="py-2 px-3 bg-green-600 text-white rounded"
            >
              Add Tree
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : trees.length === 0 ? (
            <p className="text-gray-500">You haven't submitted any trees yet.</p>
          ) : (
            <ul className="space-y-3">
              {trees.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded"
                >
                  <div className="flex-1">
                    <div className="font-semibold">
                      {t.treeName || "Untitled Tree"}
                    </div>

                    <div className="text-sm text-gray-500">
                      {t.location || "No location"} • {t.plantingDate || "No date"}
                    </div>

                    <div className="text-sm text-gray-500">
                      Status:{" "}
                      <span className={`tree-status ${getStatusClass(t.status)}`}>
                        {getStatusLabel(t.status)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500">
                      Minted: {t.minted ? "Yes" : "No"}
                      {typeof t.mintedAmount === "number" ? ` • ${t.mintedAmount} tokens` : ""}
                    </div>

                    <div className="text-sm text-gray-400">
                      {t.createdAt || t.timestamp
                        ? new Date(t.createdAt || t.timestamp).toLocaleString()
                        : ""}
                    </div>

                    {t.rejectionReason ? (
                      <div className="text-sm text-red-400 mt-1">
                        Reason: {t.rejectionReason}
                      </div>
                    ) : null}
                  </div>

                  {t.imageURL ? (
                    <img
                      src={t.imageURL}
                      alt="tree"
                      className="w-20 h-20 object-cover rounded"
                    />
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}