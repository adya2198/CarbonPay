import express from "express";
import { getWallet, mintTokens, spendTokens } from "../controllers/wallet.controller.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, getWallet);
router.post("/mint", verifyFirebaseToken, mintTokens);
router.post("/spend", verifyFirebaseToken, spendTokens);

export default router;
