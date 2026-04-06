import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

const API = "http://localhost:5000/api";

export default function AdminTreesPage() {
  const [trees, setTrees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrees();
  }, []);

  async function getToken() {
    const user = getAuth().currentUser;
    return await user.getIdToken();
  }

  async function loadTrees() {
    try {
      const token = await getToken();

      const res = await fetch(`${API}/admin/trees/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTrees(data);
    } catch (err) {
      console.error(err);
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