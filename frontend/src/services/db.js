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

/** CONFIG: tokens per tree */
const TOKEN_PER_TREE = 5;

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
 */
export async function getTransactions(uid) {
  if (!uid) throw new Error("UID is required");

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
      timestamp: data.timestamp ? data.timestamp.toMillis() : null,
    });
  });
  return list;
}

/**
 * Submit a tree entry and auto-mint tokens.
 * tree = { count, type, location, imageURL (optional) }
 */
export async function submitTree(uid, tree) {
  if (!uid) throw new Error("UID is required");
  const count = Number(tree.count) || 0;
  const minted = count * TOKEN_PER_TREE;

  // 1) create tree doc
  const treesCol = collection(db, "trees");
  const treeDocRef = await addDoc(treesCol, {
    uid,
    count,
    type: tree.type || null,
    location: tree.location || null,
    imageURL: tree.imageURL || null,
    status: "APPROVED", // or PENDING if you want admin flow
    mintedTokens: minted,
    createdAt: serverTimestamp(),
  });

  // 2) mint tokens for user (updates wallet + transaction)
  const newBalance = await mintTokens(uid, minted);

  return {
    treeId: treeDocRef.id,
    mintedTokens: minted,
    newBalance,
  };
}

/**
 * Get trees submitted by a user (ordered newest -> oldest)
 */
export async function getUserTrees(uid) {
  if (!uid) throw new Error("UID is required");
  const q = query(collection(db, "trees"), where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  const list = [];
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    list.push({
      id: docSnap.id,
      count: data.count,
      type: data.type,
      location: data.location,
      imageURL: data.imageURL || null,
      mintedTokens: data.mintedTokens || 0,
      status: data.status || null,
      timestamp: data.createdAt ? data.createdAt.toMillis() : null,
    });
  });
  return list;
}
