import express from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import itemRoutes from './item.routes.js';
import rentalRoutes from './rental.routes.js'
import walletRoutes from './wallet.routes.js'


const router = express.Router();



router.use("/auth",authRoutes)
router.use("/users",userRoutes)
router.use("/items",itemRoutes)
router.use("/rentals",rentalRoutes)
router.use("/wallet",walletRoutes)



export default router;