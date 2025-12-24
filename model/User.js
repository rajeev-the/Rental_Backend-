import mongoose from "mongoose";

     
const UserModel = new mongoose.Schema({
    name: { type: String},

    email: { type: String, required: true, unique: true },

    collegeImage: {
  type: [String],
  validate: {
    validator: function (arr) {
      return arr.length <= 2;
    },
    message: "You can upload maximum 2 images"
  }
},

        
  
    collegeEmail: { type: String }, // e.g., student@college.edu
    verified: { type: Boolean, default: false },

    year: { type: String },        // 1st, 2nd, 3rd, 4th
    department: { type: String },  // CSE, ECE, Mechanical, etc.
    hostelBlock: { type: String }, // Hostel A, B, C, etc.
    roomNumber: { type: String },

    profilePicUrl: { type: String },

    trustScore: { type: Number, default: 50 }, // 0 - 100

    listingsCount: { type: Number, default: 0 },

    successfulRentals: { type: Number, default: 0 },

    failedRentals: { type: Number, default: 0 },

    socialLinks: {
      instagram: String,
      linkedin: String,
    },
    // add inside userSchema fields:
currentRefreshToken: {
  type: String, // store raw token OR hashed token (recommended)
  select: false, // don't return by default
},
otpHash: { type: String , select: false },
otpExpiresAt: { type: Date , select: false },

  },
  { timestamps: true }
)

const User = mongoose.model("User", UserModel);

export default User;
