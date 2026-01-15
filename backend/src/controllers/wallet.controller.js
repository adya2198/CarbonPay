import { store } from "../data/store.js";

export function getWallet(req, res) {
  res.json({
    balanceKg: store.wallet.balanceKg,
  });
}

export function mintTokens(req, res) {
  const { treeCount } = req.body;

  if (!treeCount || treeCount <= 0) {
    return res.status(400).json({ message: "Invalid tree count" });
  }

  const minted = Math.round(treeCount * 20 * 0.8);
  store.wallet.balanceKg += minted;

  store.transactions.push({
    type: "MINT",
    amount: minted,
    date: new Date(),
  });

  res.json({
    minted,
    balanceKg: store.wallet.balanceKg,
  });
}

export function spendTokens(req, res) {
  const { amount } = req.body;

  if (amount > store.wallet.balanceKg) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

  store.wallet.balanceKg -= amount;

  store.transactions.push({
    type: "SPEND",
    amount,
    date: new Date(),
  });

  res.json({
    balanceKg: store.wallet.balanceKg,
  });
}
