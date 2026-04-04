import express from "express";
import { firebaseAdmin as admin } from "../firebaseAdmin.js";

const router = express.Router();

async function requireAdmin(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("No token provided");
  }

  const idToken = authHeader.split(" ")[1];
  const decoded = await admin.auth().verifyIdToken(idToken);

  if (!decoded.admin) {
    throw new Error("Forbidden");
  }

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

export default router;