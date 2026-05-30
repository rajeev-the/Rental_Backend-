import Wallet from "../model/wallet.js";

/**
 * Ensure wallet exists for user
 */
const ensureWalletExists = async (userId) => {
  let wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    wallet = await Wallet.create({
      userId: userId,
      balance: 0,
      lockedAmount: 0,
      transactions: [],
    });
  }

  return wallet;
};

/**
 * GET /api/v1/wallet
 */
export const getMyWallet = async (req, res) => {
  try {
    const wallet = await ensureWalletExists(req.user.userId);

    res.status(200).json({
      success: true,
      wallet: {
        balance: wallet.balance,
        lockedAmount: wallet.lockedAmount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/v1/wallet/add
 */
export const addMoneyToWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const wallet = await ensureWalletExists(req.user.userId);

    wallet.balance += amount;

    wallet.transactions.push({
      type: "deposit",
      amount,
      balanceAfter: wallet.balance,
      description: "Funds added to wallet",
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Money added successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * POST /api/v1/wallet/withdraw
 */
export const withdrawMoneyFromWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    const wallet = await ensureWalletExists(req.user.userId);

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }

    wallet.balance -= amount;

    wallet.transactions.push({
      type: "withdraw",
      amount,
      balanceAfter: wallet.balance,
      description: "Money withdrawn from wallet",
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: "Money withdrawn successfully",
      balance: wallet.balance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * GET /api/v1/wallet/transactions
 */
export const getWalletTransactions = async (req, res) => {
  try {
    const wallet = await ensureWalletExists(req.user.userId);

    res.status(200).json({
      success: true,
      count: wallet.transactions.length,
      transactions: wallet.transactions.sort(
        (a, b) => b.createdAt - a.createdAt
      ),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};