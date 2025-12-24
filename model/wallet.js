import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /** Available balance in wallet */
    balance: {
      type: Number,
      default: 0,
      min: 0
    },

    /** Security deposit reserved for an active rental */
    lockedAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    /** Transaction history */
    transactions: [
      {
        type: {
          type: String,
          enum: [
            "deposit",
            "withdraw",
            "rental_payment",
            "rental_refund",
            "security_lock",
            "security_release",
            "security_deduct",
            "admin_adjust"
          ],
        },
        amount: Number,
        balanceAfter: Number,
        description: String,
        rentalId: { type: mongoose.Schema.Types.ObjectId, ref: "Rental" },
        createdAt: { type: Date, default: Date.now },
      }
    ],
  },
  { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;
