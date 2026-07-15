import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, signup } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

const signup_limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		message: "Too many signup attempts. Please try again later.",
		status: "error",
	},
});

const login_limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 8,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		message: "Too many login attempts. Please try again later.",
		status: "error",
	},
});

router.post("/signup", signup_limiter, signup);
router.post("/login", login_limiter, login);
router.post("/logout", authenticate(), logout);

export default router;
