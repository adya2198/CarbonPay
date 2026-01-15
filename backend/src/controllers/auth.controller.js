import { store } from "../data/store.js";

export function login(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  store.user.email = email;

  res.json({
    user: store.user,
    message: "Login successful",
  });
}
