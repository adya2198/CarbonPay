import express from "express";
import { login, googleLogin, checkAdmin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);         // existing email login (kept)
router.post("/google", googleLogin);  // NEW: Google id_token verification
router.get("/check-admin", checkAdmin); // NEW: Check if user is admin

export default router;
