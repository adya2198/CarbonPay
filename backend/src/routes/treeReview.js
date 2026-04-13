import express from "express";
import { firebaseAdmin as admin } from "../firebaseAdmin.js";

const router = express.Router();

// Admin email from environment variable with fallback
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ranjanadya2198@gmail.com";

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const idToken = authHeader.split(" ")[1];
  const decoded = await admin.auth().verifyIdToken(idToken);

  console.log("[Admin Auth Debug]");
  console.log("  Decoded email:", decoded.email);
  console.log("  Expected email:", ADMIN_EMAIL);
  console.log("  User UID:", decoded.uid);
  console.log("  Email match:", decoded.email === ADMIN_EMAIL);

  if (decoded.email !== ADMIN_EMAIL) {
    console.log("  ❌ Email mismatch - access denied");
    throw new Error("Forbidden");
  }

  console.log("  ✅ Admin verified");
  return decoded;
}

router.post("/:treeId/review", async (req, res) => {
  try {
    const adminUser = await requireAdmin(req);
    const { treeId } = req.params;
    const { action, mintedAmount = 10, rejectionReason = "" } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ error: "Invalid action" });
    }

    const db = admin.firestore();
    const treeRef = db.collection("trees").doc(treeId);

    await db.runTransaction(async (tx) => {
      const treeSnap = await tx.get(treeRef);
      if (!treeSnap.exists) throw new Error("Tree not found");

      const tree = treeSnap.data();

      if (tree.status !== "pending") {
        throw new Error("Tree already reviewed");
      }

      const now = admin.firestore.FieldValue.serverTimestamp();

      if (action === "reject") {
        tx.update(treeRef, {
          status: "rejected",
          verifiedAt: now,
          verifiedBy: adminUser.uid,
          rejectionReason: rejectionReason || "Rejected by admin",
        });
        return;
      }

      if (tree.minted) {
        throw new Error("Tree already minted");
      }

      const userRef = db.collection("users").doc(tree.uid);
      const userSnap = await tx.get(userRef);
      if (!userSnap.exists) throw new Error("User not found");

      const currentBalance = Number(userSnap.data().balance || 0);
      const amount = Number(mintedAmount);

      tx.update(treeRef, {
        status: "approved",
        minted: true,
        mintedAmount: amount,
        verifiedAt: now,
        verifiedBy: adminUser.uid,
        rejectionReason: null,
      });

      tx.update(userRef, {
        balance: currentBalance + amount,
      });

      tx.set(db.collection("transactions").doc(), {
        uid: tree.uid,
        type: "MINT",
        amount,
        treeId,
        treeName: tree.treeName || "",
        timestamp: now,
      });
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Tree review error:", err);
    return res.status(500).json({ error: err.message || "Review failed" });
  }
});

// GET all pending trees
router.get("/pending", async (req, res) => {
  try {
    console.log("\n[GET /pending] Request received");
    const adminUser = await requireAdmin(req);

    const db = admin.firestore();

    console.log("[GET /pending] Querying pending trees...");
    const snap = await db
      .collection("trees")
      .where("status", "==", "pending")
      .get();

    console.log("[GET /pending] Found", snap.size, "pending trees");

    const list = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    console.log("[GET /pending] Returning:", list.length, "trees");
    res.json(list);
  } catch (err) {
    console.error("[GET /pending] Error:", err.message);
    res.status(500).json({ error: err.message || "Failed to fetch pending trees" });
  }
});

export default router;