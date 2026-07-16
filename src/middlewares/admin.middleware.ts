import type { Response, NextFunction } from "express";
import { AppError } from "./error-handler.middleware.js";
import { Role } from "../config/constants.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const isAdmin = (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): void => {
	if (!req.user) {
		return next(new AppError("Unauthorized. Access denied.", 401));
	}

	if (req.user.role !== Role.ADMIN) {
		return next(new AppError("Forbidden. Admins only.", 403));
	}

	next();
};
