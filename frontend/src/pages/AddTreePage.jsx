// src/pages/AddTreePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitTree } from "../services/api";
import NavBar from "../components/NavBar";

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
      <main className="page-root" style={{ padding: 28 }}>
        <div className="card" style={{ maxWidth: 680 }}>
          <h2>Add Tree</h2>
          <p className="muted">
            Submit your tree for verification. Tokens will be minted only after approval.
          </p>

          <form onSubmit={handleSubmit} style={{ marginTop: 18 }}>
            <label>Tree Name</label>
            <input
              value={treeName}
              onChange={(e) => setTreeName(e.target.value)}
              placeholder="e.g. Mango Tree"
            />

            <label>Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Rourkela, Odisha"
            />

            <label>Planting Date</label>
            <input
              type="date"
              value={plantingDate}
              onChange={(e) => setPlantingDate(e.target.value)}
            />

            <div style={{ marginTop: 12 }}>
              <button disabled={loading} type="submit">
                {loading ? "Submitting..." : "Submit for Verification"}
              </button>

              <button
                onClick={() => navigate("/")}
                type="button"
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>

            {msg && (
              <div
                style={{
                  marginTop: 12,
                  color: msg.type === "error" ? "#ff6b6b" : "#6ee7b7",
                }}
              >
                {msg.text}
              </div>
            )}
          </form>
        </div>
      </main>
    </>
  );
}