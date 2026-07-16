import express, { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlist.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { Role } from "../config/constants.js";

const router: Router = express.Router();

// All wishlist routes require authentication
router.get("/", authenticate([Role.USER, Role.ADMIN]), getWishlist);
router.post("/add", authenticate([Role.USER, Role.ADMIN]), addToWishlist);
router.delete("/:product_id", authenticate([Role.USER, Role.ADMIN]), removeFromWishlist);
router.delete("/", authenticate([Role.USER, Role.ADMIN]), clearWishlist);

export default router;
