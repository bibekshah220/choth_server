import express, { Router } from "express";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
} from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { Role } from "../config/constants.js";

const router: Router = express.Router();

// All cart routes require authentication
router.get("/", authenticate([Role.USER, Role.ADMIN]), getCart);
router.post("/add", authenticate([Role.USER, Role.ADMIN]), addItem);
router.put("/update", authenticate([Role.USER, Role.ADMIN]), updateItem);
router.delete("/remove", authenticate([Role.USER, Role.ADMIN]), removeItem);
router.delete("/clear", authenticate([Role.USER, Role.ADMIN]), clearCart);

export default router;
