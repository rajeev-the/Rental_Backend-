import mongoose from "mongoose";

const ItemModel = new mongoose.Schema({
     ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },

    description: { type: String },

    photos: [{ type: String }], // Cloudinary URLs

    category: { type: String, required: true }, // calculators, books, sports, etc.

    condition: {
      type: String,
      enum: ["new", "good", "fair", "poor"],
      default: "good",
    },

    pricePerDay: { type: Number, required: true },

    deposit: { type: Number, default: 0 },

    /** AI Fields */
    aiDemandRating: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },

   

    status: {
      type: String,
      enum: ["available", "rented", "inactive"],
      default: "available",
    },

    // Find items inside same hostel/campus easily
    location: {
      hostelBlock: String,
      ownerRoom: String,
      
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", ItemModel);

export default Item;