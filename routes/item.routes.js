import { Router } from "express";

import{
    createItem,
    getAllItems,
    getMyItems,
    getItemById,
    updateItem,
    deleteItem,
    ActivteStatus,
} from "../controllers/item.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { cacheItemsList } from "../middleware/cache.middleware.js";


const router = Router();




/**
 * POST /api/v1/items
 * Create new item
 */
router.post("/", authenticate, createItem);

/**
 * GET /api/v1/items
 * Public item listing
 */
router.get("/",cacheItemsList ,getAllItems);

/**
 * GET /api/v1/items/my
 * Get logged-in user's items
 */
router.get("/my", authenticate, getMyItems);

/**
 * GET /api/v1/items/:id
 * Get item by ID
 */
router.get("/:id", getItemById);

/**
 * PATCH /api/v1/items/:id
 * Update item (owner only)
 */
router.patch("/:id", authenticate, updateItem);


/**
 * DELETE /api/v1/items/:id
 * Delete item (owner only)
 */
router.delete("/:id", authenticate, deleteItem);

router.post("/status/:id",authenticate,ActivteStatus);






export default router;