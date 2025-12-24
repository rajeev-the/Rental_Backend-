import Item from "../model/Item.js";
import Wallet from "../model/wallet.js";
import Rental from "../model/Rental.js";
import AIReport from "../model/AIReport.js";


export const requestRental = async(req,res)=>{


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


    // ❗ updated
  if (item.ownerId.toString() === req.user.userId) {
    return res.status(400).json({
      success: false,
      message: "You cannot rent your own item",
    });
  }


  const days =
    Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    ) || 1;

     const totalCost = days * item.pricePerDay;

     const rental = await Rental.create({
    itemId,
    ownerId: item.ownerId,
    renterId: req.user.userId, // ❗ updated
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


}


/**
 * POST /api/v1/rentals/:id/approve
 */


export const approveRental = async(req,res)=>{
    
    const rental = await Rental.findById(req.params.id).populate("itemId");

    if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }
      

  //check if the logged in user is the owner

    if (rental.ownerId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  //check if rental is in pending state
  if (rental.status !== "pending") {
    return res.status(400).json({ message: "Rental cannot be approved" });
  }

   // Lock security deposit

   
   if(rental.itemId.deposit >0){
    const wallet = await Wallet.findOne({ userId: rental.renterId });
    
    if(!wallet || wallet.balance < rental.itemId.deposit){
        return res.status(400).json({ message: "Insufficient balance for deposit" });
    }
     wallet.balance -= rental.itemId.deposit;
    wallet.lockedAmount += rental.itemId.deposit;

    wallet.transactions.push({
      type: "security_lock",
      amount: rental.itemId.deposit,
      balanceAfter: wallet.balance,
      rentalId: rental._id,
      description: "Security deposit locked",
    });

    await wallet.save();

   }
     rental.status = "approved";
  rental.itemId.status = "rented";

  await rental.save();
  await rental.itemId.save();

  res.json({
    success: true,
    message: "Rental approved",
    rental,
  });



}


/**
 * POST /api/v1/rentals/:id/before-images
 */
export const uploadBeforeImages = async (req, res) => {
  const { beforeImages } = req.body;

  if (!Array.isArray(beforeImages) || beforeImages.length === 0) {
    return res.status(400).json({
      message: "beforeImages must be a non-empty array",
    });
  }

  const rental = await Rental.findById(req.params.id);

  if (!rental || rental.ownerId.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  rental.beforeImages = beforeImages;
  rental.status = "active";
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
  const { afterImages } = req.body;

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

  // 🔮 AI DAMAGE DETECTION
  const aiResult = await aiService.damageCheck({
    beforeImages: rental.beforeImages,
    afterImages,
  });

  const report = await AIReport.create({
    rentalId: rental._id,
    damageDetected: aiResult.damageDetected,
    severity: aiResult.severity,
    areas: aiResult.areas,
    confidence: aiResult.confidence,
    rawResponse: aiResult,
  });

  rental.aiReportId = report._id;
  rental.status = "returned";
  await rental.save();

  res.json({
    success: true,
    message: "After images uploaded & damage analyzed",
    aiReport: report,
  });
};


/**
 * POST /api/v1/rentals/:id/confirm-return
 */

export const confirmReturn = async (req, res) => {
  const rental = await Rental.findById(req.params.id)
    .populate("itemId")
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
    $or: [{ renterId: req.user.userId }, { ownerId: req.user.userId }],
  })
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
    .populate("itemId")
    .populate("aiReportId");

  if (!rental) {
    return res.status(404).json({ message: "Rental not found" });
  }

  if (
    rental.ownerId.toString() !== req.user.userId &&
    rental.renterId.toString() !== req.user.userId
  ) {
    return res.status(403).json({ message: "Not authorized" });
  }

  res.json({
    success: true,
    rental,
  });
};