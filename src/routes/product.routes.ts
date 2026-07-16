import express, { Router } from "express";
import {
	create,
	getAll,
	getById,
	update,
	remove,
} from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/admin.middleware.js";
import { uploader } from "../middlewares/uploader.middleware.js";

const router: Router = express.Router();

router.get("/", getAll);
router.get("/:product_id", getById);

router.post("/", authenticate(), isAdmin, uploader().array("images", 5), create);
router.put(
	"/:product_id",
	authenticate(),
	isAdmin,
	uploader().array("images", 5),
	update
);
router.delete("/:product_id", authenticate(), isAdmin, remove);

export default router;
