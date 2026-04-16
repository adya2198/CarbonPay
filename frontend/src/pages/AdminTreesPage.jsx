import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const API = "http://localhost:5000/api";

export default function AdminTreesPage() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrees();
  }, []);

  async function getToken() {
    const user = getAuth().currentUser;
    if (!user) throw new Error("Not authenticated");
    return await user.getIdToken();
  }

  async function loadTrees() {
    try {
      setError(null);
      const token = await getToken();

      const res = await fetch(`${API}/admin/trees/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error(`Failed: ${res.status}`);
      }

      const data = await res.json();
      setTrees(data);
    } catch (err) {
      console.error("Load trees error:", err);
      setError(err.message || "Failed to load trees");
      setTrees([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, action) {
    try {
      const token = await getToken();

      await fetch(`${API}/admin/trees/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });

      // refresh
      setTrees((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 30 }}>
      <h2>Admin Tree Approval</h2>

      {error && (
        <div style={{ color: "#ff6b6b", marginBottom: 15, padding: 10, border: "1px solid #ff6b6b", borderRadius: 4 }}>
          Error: {error}
        </div>
      )}

      {trees.length === 0 ? (
        <p>No pending requests</p>
      ) : (
        trees.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginBottom: 10,
              borderRadius: 8,
            }}
          >
            <div style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #eee" }}>
              <div><b>Submitted by:</b> {t.userName || "Unknown"}</div>
              <div style={{ fontSize: 12, color: "#666" }}>Email: {t.userEmail || "N/A"}</div>
            </div>

            <div><b>{t.treeName}</b></div>
            <div>{t.location}</div>
            <div>{t.plantingDate}</div>

            {t.imageURL && (
              <img
                src={t.imageURL}
                alt="tree"
                style={{ width: 120, marginTop: 10 }}
              />
            )}

            <div style={{ marginTop: 10 }}>
              <button
                onClick={() => handleAction(t.id, "approve")}
                style={{ marginRight: 10 }}
              >
                Approve
              </button>

              <button onClick={() => handleAction(t.id, "reject")}>
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}