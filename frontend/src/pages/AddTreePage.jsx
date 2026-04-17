// src/pages/AddTreePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitTree } from "../services/api";
import NavBar from "../components/NavBar";
import "../styles/addTree.css";

export default function AddTreePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [treeName, setTreeName] = useState("");
  const [location, setLocation] = useState("");
  const [plantingDate, setPlantingDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  function validate() {
    if (!treeName.trim()) return "Tree name is required";
    if (!location.trim()) return "Location is required";
    if (!plantingDate) return "Planting date is required";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user) {
      setMsg({ type: "error", text: "You must be logged in." });
      return;
    }

    const v = validate();
    if (v) {
      setMsg({ type: "error", text: v });
      return;
    }

    setLoading(true);
    setMsg(null);

    try {
      await submitTree({
        treeName: treeName.trim(),
        location: location.trim(),
        plantingDate,
      });

      setMsg({
        type: "success",
        text: "Tree submitted successfully. It is now pending verification 🌱",
      });

      setTreeName("");
      setLocation("");
      setPlantingDate("");

      setTimeout(() => {
        navigate("/my-trees");
      }, 1200);
    } catch (err) {
      console.error("Submit Tree Error:", err);
      setMsg({
        type: "error",
        text: err.message || "Submission failed",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar />
      <main className="add-tree-root">
        <div className="add-tree-container">
          <div className="add-tree-header">
            <div>
              <h1 className="add-tree-title">🌱 Plant a Tree</h1>
              <p className="add-tree-subtitle">Submit your tree for verification and earn carbon credits</p>
            </div>
          </div>

          <div className="add-tree-info-box">
            <div className="info-item">
              <span className="info-icon">✓</span>
              <div>
                <p className="info-title">Easy Process</p>
                <p className="info-text">Fill in the tree details and submit</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">⏳</span>
              <div>
                <p className="info-title">Pending Verification</p>
                <p className="info-text">Admin will review your submission</p>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🎁</span>
              <div>
                <p className="info-title">Earn Tokens</p>
                <p className="info-text">Get minted upon approval</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="add-tree-form">
            <div className="form-group">
              <label htmlFor="treeName" className="form-label">
                🌳 Tree Name <span className="required">*</span>
              </label>
              <input
                id="treeName"
                type="text"
                value={treeName}
                onChange={(e) => setTreeName(e.target.value)}
                placeholder="e.g. Mango Tree, Oak, Pine"
                className="form-input"
                required
              />
              <p className="form-hint">The type or common name of the tree</p>
            </div>

            <div className="form-group">
              <label htmlFor="location" className="form-label">
                📍 Location <span className="required">*</span>
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Rourkela, Odisha" 
                className="form-input"
                required
              />
              <p className="form-hint">City/Town where the tree is planted</p>
            </div>

            <div className="form-group">
              <label htmlFor="plantingDate" className="form-label">
                📅 Planting Date <span className="required">*</span>
              </label>
              <input
                id="plantingDate"
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                className="form-input"
                required
              />
              <p className="form-hint">When was this tree planted</p>
            </div>

            {msg && (
              <div className={`form-message msg-${msg.type}`}>
                <span className="msg-icon">{msg.type === "success" ? "✓" : "⚠"}</span>
                <span className="msg-text">{msg.text}</span>
              </div>
            )}

            <div className="form-actions">
              <button
                disabled={loading}
                type="submit"
                className="btn-submit"
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Submitting...
                  </>
                ) : (
                  <>✓ Submit for Verification</>
                )}
              </button>
              <button
                onClick={() => navigate("/")}
                type="button"
                className="btn-cancel"
              >
                ← Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}