import express, { Router } from "express";
import {
  create,
  getMyOrders,
  getAll,
  getById,
  updateStatus,
  cancel,
} from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { Role } from "../config/constants.js";

const router: Router = express.Router();

// User routes
router.post("/", authenticate([Role.USER, Role.ADMIN]), create);
router.get("/my", authenticate([Role.USER, Role.ADMIN]), getMyOrders);
router.get("/:order_id", authenticate([Role.USER, Role.ADMIN]), getById);
router.post("/:order_id/cancel", authenticate([Role.USER, Role.ADMIN]), cancel);

// Admin routes
router.get("/", authenticate([Role.ADMIN]), getAll);
router.patch("/:order_id/status", authenticate([Role.ADMIN]), updateStatus);

export default router;
