import Item from "../model/Item.js";
import Wallet from "../model/wallet.js";
import Rental from "../model/Rental.js";
import AIReport from "../model/AIReport.js";
import { damageCheck } from "./aicontroller.js";
import { aiQueue } from "../config/queue.js";

export const requestRental = async (req, res) => {
  const { itemId, startDate, endDate, meetingLocation } = req.body;

  if (!itemId || !startDate || !endDate || !meetingLocation) {
    return res.status(400).json({
      success: false,
      message: "itemId, startDate, endDate and meetingLocation are required",
    });
  }

  const item = await Item.findById(itemId);
  if (!item || item.status !== "available") {
    return res.status(400).json({
      success: false,
      message: "Item is not available",
    });
  }

  // ❗ Prevent self-rent
  if (item.ownerId.toString() === req.user.userId) {
    return res.status(400).json({
      success: false,
      message: "You cannot rent your own item",
    });
  }

  // Calculate days
  const days =
    Math.ceil(
      (new Date(endDate) - new Date(startDate)) /
        (1000 * 60 * 60 * 24)
    ) || 1;

  const totalCost = days * item.pricePerDay;

  // ✅ Wallet check BEFORE request
  const wallet = await Wallet.findOne({ userId: req.user.userId });

  if (!wallet) {
    return res.status(400).json({
      success: false,
      message: "Wallet not found",
    });
  }

  // Check deposit balance
  if (item.deposit > 0 && wallet.balance < item.deposit) {
    return res.status(400).json({
      success: false,
      message: "Insufficient balance for deposit",
    });
  }

  // 🔒 Lock deposit immediately
  if (item.deposit > 0) {
    wallet.balance -= item.deposit;
    wallet.lockedAmount += item.deposit;

    wallet.transactions.push({
      type: "security_lock",
      amount: item.deposit,
      balanceAfter: wallet.balance,
      description: "Security deposit locked at request",
    });

    await wallet.save();
  }

  // Create rental
  const rental = await Rental.create({
    itemId,
    ownerId: item.ownerId,
    renterId: req.user.userId,
    startDate,
    endDate,
    totalCost,
    meetingLocation,
    status: "pending",
  });

  res.status(201).json({
    success: true,
    message: "Rental request sent",
    rental,
  });
};


/**
 * POST /api/v1/rentals/:id/approve
 */


export const approveRental = async (req, res) => {
  const rental = await Rental.findById(req.params.id).populate("itemId");

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }

  // Owner check
  if (rental.ownerId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  // Status check
  if (rental.status !== "pending") {
    return res.status(400).json({ message: "Rental cannot be approved" });
  }

  // ✅ No wallet logic here anymore

  rental.status = "approved";
  rental.itemId.status = "rented";
 // ✅ Correct OTP generation (Node.js)
  rental.userotp = (1000 + Math.floor(Math.random() * 9000)).toString();
  await rental.save();
  await rental.itemId.save();

  res.json({
    success: true,
    message: "Rental approved",
    rental,
  });
};

/**
 * POST /api/v1/rentals/:id/before-images
 */
export const uploadBeforeImages = async (req, res) => {
  const { beforeImages ,otp } = req.body;

  if (!Array.isArray(beforeImages) || beforeImages.length === 0) {
    return res.status(400).json({
      message: "beforeImages must be a non-empty array",
    });
  }

  const rental = await Rental.findById(req.params.id).select("+userotp");

  if (!rental || rental.ownerId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  rental.beforeImages = beforeImages;

  if(rental.userotp !=  otp) {
      return res.status(400).json({ message: "Otp is incorrcet " });
   }
  rental.status = "active";
  rental.rentalotp =(1000 + Math.floor(Math.random() * 9000)).toString();

  await rental.save();

  res.json({
    success: true,
    message: "Before images uploaded",
  });
};

/**
 * POST /api/v1/rentals/:id/after-images
 */

export const uploadAfterImages = async (req, res) => {
  const { afterImages} = req.body;

  if (!Array.isArray(afterImages) || afterImages.length === 0) {
    return res.status(400).json({
      message: "afterImages must be a non-empty array",
    });
  }

  const rental = await Rental.findById(req.params.id);

  if (!rental || rental.renterId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  rental.afterImages = afterImages;
  rental.status = "returned";
  await rental.save();

  await aiQueue.add("damage-check",{
    rentalId :rental._id,
    beforeImages:rental.beforeImages,
    afterImages
  });

  res.json({
    success: true,
    message: "After images uploaded & damage analyzed",
    aiReport: report,
  });
};


/**
 * POST /api/v1/rentals/:id/confirm-return
 * 
 *  send the rental otp in this 
 */

export const confirmReturn = async (req, res) => {
     
  const {otp} = req.body

  const rental = await Rental.findById(req.params.id)
    .populate("itemId +rentalotp")
    .populate("aiReportId");

  if (!rental || rental.ownerId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const wallet = await Wallet.findOne({ userId: rental.renterId });
  const deposit = rental.itemId.deposit || 0;

  if (deposit > 0) {
    if (rental.aiReportId?.damageDetected) {
      // Deduct deposit
      wallet.lockedAmount -= deposit;

      wallet.transactions.push({
        type: "security_deduct",
        amount: deposit,
        balanceAfter: wallet.balance,
        rentalId: rental._id,
        description: "Deposit deducted due to damage",
      });
    } else {
      // Release deposit
      wallet.lockedAmount -= deposit;
      wallet.balance += deposit;

      wallet.transactions.push({
        type: "security_release",
        amount: deposit,
        balanceAfter: wallet.balance,
        rentalId: rental._id,
        description: "Deposit released",
      });
    }
    await wallet.save();
  }
  
  if(rental.rentalotp != otp){
     res.json({
    success: false,
    message: "otp is incorrcet",
  });
  }

  rental.status = "completed";
  rental.itemId.status = "available";

  await rental.save();
  await rental.itemId.save();

  res.json({
    success: true,
    message: "Rental completed successfully",
  });
};


/**
 * GET /api/v1/rentals/my
 */
export const getMyRentals = async (req, res) => {
  const rentals = await Rental.find({
    $or: [{ ownerId: req.user.userId }],
  })
    
    .populate("itemId")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    rentals,
  });
};

export const getMyRentalsUsers = async (req, res) => {
  const rentals = await Rental.find({
    renterId: req.user.userId,
  })
    .select("+userotp") // 👈 include hidden field
    .populate("itemId")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    rentals,
  });
};

/**
 * GET /api/v1/rentals/:id
 */

export const getRentalById = async (req, res) => {
  const rental = await Rental.findById(req.params.id)
    .select("+userotp")
    .populate("itemId")

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }
 

  res.json({
    success: true,
    rental,
  });
 
};


export const getRentalByIdOwner = async (req, res) => {
  const rental = await Rental.findById(req.params.id)
    .select("+rentalotp")
    .populate("itemId")
   

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }
 

  res.json({
    success: true,
    rental,
  });

};