import mongoose from "mongoose";

const aiReportSchema = new mongoose.Schema(
  {
    rentalId: { type: mongoose.Schema.Types.ObjectId, ref: "Rental", required: true },

    damageDetected: { type: Boolean, required: true },

    severity: {
      type: String,
      enum: ["none", "low", "medium", "high"],
      default: "none",
    },

    areas: [{ type: String }], // e.g., ["left corner", "lens area"]

    confidence: { type: Number }, // AI confidence 0 - 1

    diffImageUrl: { type: String }, // optional AI generated comparison image

    rawResponse: mongoose.Schema.Types.Mixed, // Entire AI output
  },
  { timestamps: true }
);

const AIReport = mongoose.model("AIReport", aiReportSchema);
export default AIReport;
