import express from "express";
import { getTransactions } from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/", getTransactions);

export default router;
