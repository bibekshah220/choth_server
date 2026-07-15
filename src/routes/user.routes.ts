import express, { Router } from "express";
import { getAll, getById, update, remove } from "../controllers/user.controller.js";
import { uploader } from "../middlewares/uploader.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { Role } from "../config/constants.js";

const router: Router = express.Router();
const upload = uploader();

router.get("/", authenticate([Role.ADMIN]), getAll);
router.get("/:user_id", authenticate([Role.USER, Role.ADMIN]), getById);
router.put(
  "/:user_id",
  authenticate([Role.USER, Role.ADMIN]),
  upload.single("profile_image"),
  update
);
router.delete("/:user_id", authenticate([Role.USER, Role.ADMIN]), remove);

export default router;