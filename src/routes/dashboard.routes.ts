import express, { Router } from "express";
import {
  getDashboardStats,
  getSalesAnalytics,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { Role } from "../config/constants.js";

const router: Router = express.Router();

// Admin only routes
router.get("/stats", authenticate([Role.ADMIN]), getDashboardStats);
router.get("/analytics", authenticate([Role.ADMIN]), getSalesAnalytics);

export default router;
