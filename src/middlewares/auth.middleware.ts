import type { Response, NextFunction } from "express";
import { AppError } from "./error-handler.middleware.js";
import { verify_token } from "../utils/jwt.utils.js";
import User from "../models/user.model.js";
import { Role } from "../config/constants.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const authenticate = (roles: Role[] = []) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.cookies.access_token;

      if (!token) {
        throw new AppError("Unauthorized. Access denied.", 401);
      }

      const decoded_data = verify_token(token);

      if (!decoded_data) {
        throw new AppError("Unauthorized. Access denied.", 401);
      }

      if (Date.now() > Number(decoded_data.exp) * 1000) {
        throw new AppError("Token Expired. Access denied.", 401);
      }

      const user = await User.findOne({
        _id: decoded_data._id,
        email: decoded_data.email,
      });

      if (!user) {
        throw new AppError("Unauthorized. Access denied.", 401);
      }

      if (roles.length > 0 && !roles.includes(user.role)) {
        throw new AppError("Forbidden. Access denied.", 403);
      }

      req.user = {
        _id: String(user._id),
        email: user.email,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};