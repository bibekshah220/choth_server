import express, { Router } from "express";
import {
  createReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview,
} from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { Role } from "../config/constants.js";

const router: Router = express.Router();

// Public: get reviews for a product
router.get("/product/:product_id", getProductReviews);

// User routes
router.get("/my", authenticate([Role.USER, Role.ADMIN]), getMyReviews);
router.post("/", authenticate([Role.USER, Role.ADMIN]), createReview);
router.put("/:review_id", authenticate([Role.USER, Role.ADMIN]), updateReview);
router.delete("/:review_id", authenticate([Role.USER, Role.ADMIN]), deleteReview);

// Admin routes
router.get("/", authenticate([Role.ADMIN]), getAllReviews);
router.delete("/admin/:review_id", authenticate([Role.ADMIN]), adminDeleteReview);

export default router;
