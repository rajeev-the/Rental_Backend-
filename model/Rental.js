
import mongoose from "mongoose";


const rentalSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    startDate: { type: Date, required: true },

    endDate: { type: Date, required: true },

    totalCost: { type: Number },

    status: {
      type: String,
      enum: ["pending", "approved", "active", "returned", "disputed", "completed"],
      default: "pending",
    },

    meetingLocation: { type: String, required: true },

    /** Images for AI damage detection */
    beforeImages: [{ type: String }],

    afterImages: [{ type: String }],
    rentalotp:{
     type:String,
     select:false,
    },
     userotp:{
     type:String,
     select:false
    },
    aiReportId: { type: mongoose.Schema.Types.ObjectId, ref: "AIReport" },

    disputeMessage: { type: String },
  },
  { timestamps: true }
);

const Rental = mongoose.model("Rental", rentalSchema);
export default Rental;
