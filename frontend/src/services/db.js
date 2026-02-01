// src/services/db.js
import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/**
 * Initialize user document (if not exists)
 */
export async function initializeUser(uid, email) {
  if (!uid) throw new Error("UID is required");
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: email || null,
      balance: 0,
      createdAt: serverTimestamp(),
    });
  }
  return userRef;
}

/**
 * Get wallet object for a user
 * returns { email, balance, createdAt }
 */
export async function getWallet(uid) {
  if (!uid) throw new Error("UID is required");
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return { balance: 0 };
  return snap.data();
}

/**
 * Mint tokens for user and add transaction
 */
export async function mintTokens(uid, amount) {
  if (!uid) throw new Error("UID is required");
  if (typeof amount !== "number") amount = Number(amount) || 0;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const current = snap.exists() && snap.data().balance ? snap.data().balance : 0;
  const newBalance = current + amount;
  await updateDoc(userRef, { balance: newBalance });
  await addDoc(collection(db, "transactions"), {
    uid,
    type: "MINT",
    amount,
    timestamp: serverTimestamp(),
  });
  return newBalance;
}

/**
 * Spend tokens for user and add transaction
 */
export async function spendTokens(uid, amount) {
  if (!uid) throw new Error("UID is required");
  if (typeof amount !== "number") amount = Number(amount) || 0;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  const current = snap.exists() && snap.data().balance ? snap.data().balance : 0;
  if (current < amount) throw new Error("Insufficient balance");
  const newBalance = current - amount;
  await updateDoc(userRef, { balance: newBalance });
  await addDoc(collection(db, "transactions"), {
    uid,
    type: "SPEND",
    amount,
    timestamp: serverTimestamp(),
  });
  return newBalance;
}

/**
 * Get transactions for the user ordered by timestamp desc
 * returns an array of { id, uid, type, amount, timestampMillis }
 */
export async function getTransactions(uid) {
  if (!uid) throw new Error("UID is required");
  // query transactions where uid == uid, order by timestamp desc
  const q = query(
    collection(db, "transactions"),
    where("uid", "==", uid),
    orderBy("timestamp", "desc")
  );
  const snap = await getDocs(q);
  const list = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    list.push({
      id: docSnap.id,
      uid: data.uid,
      type: data.type,
      amount: data.amount,
      // convert Firestore timestamp to millis (safe even if undefined)
      timestamp: data.timestamp ? data.timestamp.toMillis() : 0,
    });
  });
  return list;
}
