import { store } from "../data/store.js";
import { OAuth2Client } from "google-auth-library";

export function login(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  store.user.email = email;
  res.json({ user: store.user, message: "Login successful" });
}

// Google sign-in: verify id_token and return user
export async function googleLogin(req, res) {
  try {
    const { id_token } = req.body;
    if (!id_token) return res.status(400).json({ message: "id_token required" });

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload(); // contains email, name, sub (google id)
    const userId = payload.sub;
    const email = payload.email;
    const name = payload.name || payload.email.split("@")[0];

    // Simple store: replace or extend for multi-user DB later
    store.user = { id: userId, name, email };

    res.json({ user: store.user, message: "Google login successful" });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ message: "Invalid Google token" });
  }
}
