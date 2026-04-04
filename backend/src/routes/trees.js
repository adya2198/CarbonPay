import express from "express";
import crypto from "crypto";
import { firebaseAdmin as admin } from "../firebaseAdmin.js";

const router = express.Router();

function makeFingerprint({ uid, treeName, location, plantingDate }) {
  const raw = `${uid}|${treeName.trim().toLowerCase()}|${location.trim().toLowerCase()}|${plantingDate}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
}

router.post("/", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const idToken = authHeader.split(" ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);

    const { treeName, location, plantingDate, imageURL } = req.body;

    if (!treeName || !location || !plantingDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = admin.firestore();
    const treesRef = db.collection("trees");
    const fingerprint = makeFingerprint({
      uid: decoded.uid,
      treeName,
      location,
      plantingDate,
    });

    const existingSnap = await treesRef
      .where("fingerprint", "==", fingerprint)
      .where("status", "in", ["pending", "approved"])
      .limit(1)
      .get();

    if (!existingSnap.empty) {
      return res.status(409).json({ error: "Duplicate tree claim detected" });
    }

    const treeDoc = {
      uid: decoded.uid,
      treeName,
      location,
      plantingDate,
      imageURL: imageURL || null,
      status: "pending",
      minted: false,
      mintedAmount: 0,
      fingerprint,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedAt: null,
      verifiedBy: null,
      rejectionReason: null,
    };

    const ref = await treesRef.add(treeDoc);

    return res.json({
      ok: true,
      treeId: ref.id,
      status: "pending",
      message: "Tree submitted for verification",
    });
  } catch (err) {
    console.error("Tree submit error:", err);
    return res.status(500).json({ error: err.message || "Tree submit failed" });
  }
});

export default router;