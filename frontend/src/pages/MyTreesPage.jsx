// src/pages/MyTreesPage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserTrees } from "../services/api";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/myTrees.css";

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
    if (s === "pending") return "⏳ Pending";
    if (s === "approved") return "✓ Approved";
    if (s === "rejected") return "✗ Rejected";
    return "?";
  }

  function getStatusClass(status) {
    const s = (status || "").toLowerCase();
    if (s === "pending") return "status-pending";
    if (s === "approved") return "status-approved";
    if (s === "rejected") return "status-rejected";
    return "";
  }


  return (
    <>
      <NavBar />
      <main className="page-root mt-trees">
        <div className="trees-header">
          <div>
            <h1 className="trees-title">🌳 My Trees</h1>
            <p className="trees-subtitle">Manage and track all your submitted trees</p>
          </div>
          <button
            onClick={() => navigate("/add-tree")}
            className="btn-add-tree"
          >
            + Plant Tree
          </button>
        </div>

        {loading ? (
          <div className="trees-loading">
            <div className="spinner"></div>
            <p>Loading your trees...</p>
          </div>
        ) : trees.length === 0 ? (
          <div className="trees-empty">
            <div className="empty-icon">🌱</div>
            <h3>No Trees Yet</h3>
            <p>Start planting! Submit your first tree and earn carbon credits.</p>
            <button
              onClick={() => navigate("/add-tree")}
              className="btn-primary"
            >
              Plant Your First Tree
            </button>
          </div>
        ) : (
          <div className="trees-grid">
            {trees.map((t) => (
              <div key={t.id} className="tree-card">
                {t.imageURL && (
                  <div className="tree-image-wrapper">
                    <img
                      src={t.imageURL}
                      alt={t.treeName || "tree"}
                      className="tree-image"
                    />
                  </div>
                )}

                <div className="tree-card-content">
                  <div className="tree-header-row">
                    <h3 className="tree-name">{t.treeName || "Untitled Tree"}</h3>
                    <span className={`tree-status ${getStatusClass(t.status)}`}>
                      {getStatusLabel(t.status)}
                    </span>
                  </div>

                  <div className="tree-meta">
                    <div className="meta-item">
                      <span className="meta-label">📍 Location</span>
                      <span className="meta-value">{t.location || "Not specified"}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">📅 Planted</span>
                      <span className="meta-value">{t.plantingDate || "Not specified"}</span>
                    </div>
                  </div>

                  {t.minted && (
                    <div className="tree-tokens">
                      <span className="token-icon">⚡</span>
                      <span className="token-value">
                        {typeof t.mintedAmount === "number"
                          ? `${t.mintedAmount} tokens minted`
                          : "Minted"}
                      </span>
                    </div>
                  )}

                  {t.rejectionReason && (
                    <div className="tree-rejection">
                      <span className="rejection-label">Rejection Reason:</span>
                      <p>{t.rejectionReason}</p>
                    </div>
                  )}

                  {t.createdAt || t.timestamp ? (
                    <div className="tree-date">
                      {new Date(t.createdAt || t.timestamp).toLocaleDateString()}
                    </div>
                  ) : null}

                  <div className="tree-actions">
                    <button className="action-btn view-btn">View Details</button>
                    {t.status?.toLowerCase() === "rejected" && (
                      <button className="action-btn resubmit-btn">Resubmit</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}