import { store } from "../data/store.js";

export function getTransactions(req, res) {
  res.json(store.transactions);
}
