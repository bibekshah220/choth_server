import express, { Router } from "express";
import {
  create,
  getAll,
  getById,
  update,
  remove,
} from "../controllers/category.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { uploader } from "../middlewares/uploader.middleware.js";
import { Role } from "../config/constants.js";

const router: Router = express.Router();
const upload = uploader();

// Public routes
router.get("/", getAll);
router.get("/:category_id", getById);

// Admin routes
router.post("/", authenticate([Role.ADMIN]), upload.single("image"), create);
router.put("/:category_id", authenticate([Role.ADMIN]), upload.single("image"), update);
router.delete("/:category_id", authenticate([Role.ADMIN]), remove);

export default router;
