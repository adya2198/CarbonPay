const API = "http://localhost:5000/api";

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
  const res = await fetch(`${API}/wallet`);
  return res.json();
}

export async function mintTokens(treeCount) {
  const res = await fetch(`${API}/wallet/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ treeCount })
  });
  return res.json();
}

export async function spendTokens(amount) {
  const res = await fetch(`${API}/wallet/spend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount })
  });
  return res.json();
}
