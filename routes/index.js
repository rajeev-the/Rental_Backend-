import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import itemRoutes from './item.routes.js';
import rentalRoutes from './rental.routes.js'
import walletRoutes from './wallet.routes.js'
import {upload} from "../middleware/upload.js"



import { authenticate } from "../middleware/auth.middleware.js";
const router = express.Router();



router.use("/auth",authRoutes)
router.use("/users",userRoutes)
router.use("/items",itemRoutes)
router.use("/rentals",rentalRoutes)
router.use("/wallet",walletRoutes)
router.post("/upload", authenticate,upload.single("image"), (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      message: "File not uploaded"
    });
  }

  res.status(200).json({
    message: "Image uploaded successfully",
    imageurl: req.file.location
  });

});



export default router;