import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import transferRouter from "./routes/transfer.js";

dotenv.config();

import authRoutes from "./routes/auth.routes.js";
import walletRoutes from "./routes/wallet.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api", transferRouter);

app.get("/", (req, res) => {
  res.send("CarbonPay backend running");
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
