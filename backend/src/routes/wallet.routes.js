import express from "express";
import {
  getWallet,
  mintTokens,
  spendTokens,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.get("/", getWallet);
router.post("/mint", mintTokens);
router.post("/spend", spendTokens);

export default router;
