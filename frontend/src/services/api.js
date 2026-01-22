import { getAuth } from "firebase/auth";

const API = "http://localhost:5000/api";

async function getToken() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
}

export async function login(email) {
  const res = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return res.json();
}

export async function googleLogin(id_token) {
  const res = await fetch(`${API}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token })
  });
  return res.json();
}

export async function getWallet() {
  const token = await getToken();
  const res = await fetch(`${API}/wallet`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}


export async function mintTokens(treeCount) {
  const token = await getToken();
  const res = await fetch(`${API}/wallet/mint`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ treeCount }),
  });
  return res.json();
}


export async function spendTokens(amount) {
  const token = await getToken();
  const res = await fetch(`${API}/wallet/spend`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ amount }),
  });
  return res.json();
}

export async function getTransactions() {
  const token = await getToken();
  const res = await fetch(`${API}/transactions`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

