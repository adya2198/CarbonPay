// src/pages/AddTreePage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { submitTree } from "../services/api";
import { storage } from "../firebase";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";

// ----------- HELPERS -----------------

// sanitize filename to avoid URL issues
function sanitizeFileName(name) {
  const safe = name.replace(/[^\w.\-]/g, "_");
  return safe.length > 120 ? safe.slice(0, 120) : safe;
}

/**
 * Upload file with retry + progress
 */
async function uploadFileWithRetries(storage, userUid, file, maxRetries = 2, onProgress) {
  if (!file) return null;

  const cleaned = sanitizeFileName(file.name);
  const path = `trees/${userUid}/${Date.now()}_${cleaned}`;
  const sref = storageRef(storage, path);

  let attempt = 0;

  while (attempt <= maxRetries) {
    attempt++;

    try {
      const uploadTask = uploadBytesResumable(sref, file);

      const downloadURL = await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            if (onProgress && snapshot.totalBytes) {
              const pct = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );
              onProgress(pct);
            }
          },
          (error) => {
            console.error(
              `Upload error on attempt ${attempt}:`,
              error.code || error.message
            );
            reject(error);
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(url);
            } catch (err) {
              reject(err);
            }
          }
        );
      });

      return downloadURL; // success!
    } catch (err) {
      console.warn(`Upload attempt ${attempt} failed`, err);
      if (attempt > maxRetries) throw err;

      // wait before retry
      await new Promise((r) => setTimeout(r, 600 * attempt));
    }
  }

  return null;
}

// -------- COMPONENT --------

export default function AddTreePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [count, setCount] = useState(1);
  const [type, setType] = useState("native");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");

    setSubmitting(true);
    setUploadProgress(null);

    try {
      let imageURL = null;

      // attempt upload if file selected
      if (file) {
        try {
          imageURL = await uploadFileWithRetries(
            storage,
            user.uid,
            file,
            2,
            (pct) => setUploadProgress(pct)
          );
        } catch (uploadErr) {
          console.error("Final upload error:", uploadErr);
          alert("Image upload failed. Submitting without image.");
          imageURL = null;
        }
      }

      const response = await submitTree({
        count,
        type,
        location,
        imageURL,
      });

      alert(
        `Successfully submitted!\nMinted ${response.mintedTokens} tokens.\nNew balance: ${response.newBalance}`
      );

      navigate("/my-trees");
    } catch (err) {
      console.error("Submit Tree Error:", err);
      alert(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4">Register Trees</h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm font-medium">Number of Trees</label>
            <input
              type="number"
              min="1"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="mt-1 w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tree Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            >
              <option value="native">Native</option>
              <option value="fruit">Fruit</option>
              <option value="evergreen">Evergreen</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Rourkela, Odisha"
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Upload Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1"
            />
          </div>

          {uploadProgress !== null && (
            <p className="text-sm text-blue-600">Upload: {uploadProgress}%</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            {submitting ? "Submitting..." : "Submit & Mint Tokens"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full mt-3 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
        </form>
      </div>
    </main>
  );
}
