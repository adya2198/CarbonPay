import { firebaseAdmin } from "../firebaseAdmin.js";

export async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = decoded; // contains uid, email, name, picture, etc.
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
