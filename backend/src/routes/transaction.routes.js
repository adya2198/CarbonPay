import express from "express";
import { getTransactions } from "../controllers/transaction.controller.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyFirebaseToken, getTransactions);

export default router;
