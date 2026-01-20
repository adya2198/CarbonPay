import express from "express";
import { login, googleLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);         // existing email login (kept)
router.post("/google", googleLogin);  // NEW: Google id_token verification

export default router;
