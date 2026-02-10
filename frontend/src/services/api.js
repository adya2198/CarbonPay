// src/services/api.js
import { auth } from "../firebase";
import {
  initializeUser,
  getWallet as dbGetWallet,
  mintTokens as dbMint,
  spendTokens as dbSpend,
  getTransactions as dbGetTxns,
  submitTree as dbSubmitTree,
  getUserTrees as dbGetUserTrees,
} from "./db";

function uid() {
  return auth.currentUser?.uid || null;
}

export async function loginWithGoogle() {
  const user = auth.currentUser;
  if (!user) throw new Error("No authenticated user");
  await initializeUser(user.uid, user.email || null);
  return {
    uid: user.uid,
    name: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
  };
}

export async function getWallet() {
  const id = uid();
  if (!id) throw new Error("Not authenticated");
  const w = await dbGetWallet(id);
  return { balance: w?.balance ?? 0, ...w };
}

export async function mintTokens(amount) {
  const id = uid();
  if (!id) throw new Error("Not authenticated");
  return await dbMint(id, amount);
}

export async function spendTokens(amount) {
  const id = uid();
  if (!id) throw new Error("Not authenticated");
  return await dbSpend(id, amount);
}

export async function getTransactions() {
  const id = uid();
  if (!id) throw new Error("Not authenticated");
  return await dbGetTxns(id);
}

/** NEW: submit a tree and auto-mint */
export async function submitTree(tree) {
  const id = uid();
  if (!id) throw new Error("Not authenticated");
  return await dbSubmitTree(id, tree);
}

/** NEW: get user's trees */
export async function getUserTrees() {
  const id = uid();
  if (!id) throw new Error("Not authenticated");
  return await dbGetUserTrees(id);
}
