// backend/src/routes/transfer.js
import express from "express";
import { firebaseAdmin as admin } from "../firebaseAdmin.js";// default export from step 1
const router = express.Router();

// POST /api/transfer
// body: { receiverEmail, amount }
router.post("/transfer", async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    const idToken = authHeader.split(" ")[1];

    // verify token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const senderUid = decoded.uid;
    const senderEmail = decoded.email || null;

    const { receiverEmail, amount } = req.body;
    const amt = Number(amount);

    if (!receiverEmail || !amt || amt <= 0 || !Number.isFinite(amt)) {
      return res.status(400).json({ error: "Invalid receiver or amount" });
    }

    const db = admin.firestore();
    const usersRef = db.collection("users");

    // find receiver document by email
    const querySnap = await usersRef.where("email", "==", receiverEmail).limit(1).get();
    if (querySnap.empty) {
      return res.status(404).json({ error: "Receiver not found" });
    }
    const receiverDoc = querySnap.docs[0];
    const receiverRef = receiverDoc.ref;
    const receiverUid = receiverRef.id;

    // Run Firestore transaction
    await db.runTransaction(async (tx) => {
      const senderRef = usersRef.doc(senderUid);
      const sSnap = await tx.get(senderRef);
      if (!sSnap.exists) throw new Error("Sender wallet not found");
      const sData = sSnap.data() || {};
      const senderBalance = Number(sData.balance) || 0;

      if (senderBalance < amt) {
        // abort transaction
        throw new Error("insufficient_funds");
      }

      // read receiver (may exist)
      const rSnap = await tx.get(receiverRef);
      if (!rSnap.exists) {
        tx.set(receiverRef, {
          email: receiverEmail,
          balance: amt,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      } else {
        const rData = rSnap.data() || {};
        const recvBal = Number(rData.balance) || 0;
        tx.update(receiverRef, { balance: recvBal + amt });
      }

      // update sender balance
      tx.update(senderRef, { balance: senderBalance - amt });

      // create transaction logs
      const transactionsRef = db.collection("transactions");
      const now = admin.firestore.FieldValue.serverTimestamp();

      const senderTx = {
        uid: senderUid,
        type: "SEND",
        amount: amt,
        toUid: receiverUid,
        toEmail: receiverEmail,
        timestamp: now,
      };
      const receiverTx = {
        uid: receiverUid,
        type: "RECEIVE",
        amount: amt,
        fromUid: senderUid,
        fromEmail: senderEmail,
        timestamp: now,
      };

      tx.set(transactionsRef.doc(), senderTx);
      tx.set(transactionsRef.doc(), receiverTx);
    });

    return res.json({ ok: true, message: "Transfer successful" });
  } catch (err) {
    console.error("Transfer error:", err);
    if (err.message === "insufficient_funds") {
      return res.status(400).json({ error: "insufficient_funds" });
    }
    return res.status(500).json({ error: err.message || "internal_error" });
  }
});

export default router;
