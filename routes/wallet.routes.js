import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  getMyWallet,
  addMoneyToWallet,
  withdrawMoneyFromWallet,
  getWalletTransactions,
} from "../controllers/wallet.controller.js";

const router = Router();

/**
 * GET /api/v1/wallet
 * Get logged-in user's wallet
 */
router.get("/", authenticate, getMyWallet);

/**
 * POST /api/v1/wallet/add
 * Add money to wallet (manual / payment-gateway later)
 */
router.post("/add", authenticate, addMoneyToWallet);

/**
 * POST /api/v1/wallet/withdraw
 * Withdraw money from wallet
 */
router.post("/withdraw", authenticate, withdrawMoneyFromWallet);

/**
 * GET /api/v1/wallet/transactions
 * Get wallet transaction history
 */
router.get("/transactions", authenticate, getWalletTransactions);

export default router;
