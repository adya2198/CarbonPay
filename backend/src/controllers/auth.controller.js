import { store } from "../data/store.js";
import { OAuth2Client } from "google-auth-library";
import { firebaseAdmin } from "../firebaseAdmin.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "ranjanadya2198@gmail.com";

export function login(req, res) {
  return res.status(401).json({
    message: "Email/password login is disabled. Use Google sign-in only."
  });
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

// Check if current user is admin
export async function checkAdmin(req, res) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided", isAdmin: false });
    }

    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(token);
      const isAdmin = decoded.email === ADMIN_EMAIL;
      
      res.json({ 
        isAdmin,
        email: decoded.email,
        message: isAdmin ? "Admin verified" : "Not an admin"
      });
    } catch (error) {
      return res.status(401).json({ message: "Invalid token", isAdmin: false });
    }
  } catch (err) {
    console.error("Check admin error:", err);
    res.status(500).json({ message: "Server error", isAdmin: false });
  }
}
