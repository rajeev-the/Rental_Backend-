import { Router } from "express";


import { authenticate } from "../middleware/auth.middleware.js";

import {approveRental,
    requestRental,
    uploadBeforeImages,
    uploadAfterImages,
    confirmReturn,
    getMyRentals,
    getRentalById


} from "../controllers/rental.controller.js";



const router = Router();



/**
 * POST /api/v1/rentals/request
 * Renter requests an item
 */
router.post("/request", authenticate, requestRental);

/**
 * POST /api/v1/rentals/:id/approve
 * Owner approves rental
 */
router.post("/:id/approve", authenticate, approveRental);

/**
 * POST /api/v1/rentals/:id/before-images
 * Owner uploads before images (array of URLs)
 */

router.post("/:id/before-images", authenticate, uploadBeforeImages);

/**
 * POST /api/v1/rentals/:id/after-images
 * Renter uploads after images (array of URLs)
 * Triggers AI damage detection
 */

router.post("/:id/after-images", authenticate, uploadAfterImages);

/**
 * POST /api/v1/rentals/:id/confirm-return
 * Owner confirms return (release or deduct deposit)
 */

router.post("/:id/confirm-return", authenticate, confirmReturn);

/**
 * GET /api/v1/rentals/my
 * Get my rentals (as owner or renter)
 */

router.get("/my", authenticate, getMyRentals);

/**
 * GET /api/v1/rentals/:id
 * Get rental by ID
 */

router.get("/:id", authenticate, getRentalById);





export default router;