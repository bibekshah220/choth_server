import type { Response, NextFunction } from "express";
import { AppError } from "../middlewares/error-handler.middleware.js";
import User from "../models/user.model.js";
import { delete_file, upload_file } from "../utils/cloudinary.utils.js";
import type { AuthenticatedRequest } from "../types/index.js";

export const getById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = req.params.user_id;

    if (!user_id || Array.isArray(user_id)) {
      throw new AppError("Invalid user id", 400);
    }

    const user = await User.findById(user_id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      message: "user by id fetched",
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await User.find({});

    res.status(200).json({
      message: "all users fetched",
      status: "success",
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.profile_image) {
      await delete_file(user.profile_image.public_id);
    }

    await user.deleteOne();

    res.status(200).json({
      message: "user deleted successfully",
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const update = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { first_name, last_name, gender, phone } = req.body;
    const file = req.file;

    const update_data: {
      first_name?: string;
      last_name?: string;
      name?: string;
      gender?: string;
      phone?: string;
    } = {};

    if (first_name !== undefined) update_data.first_name = first_name;
    if (last_name !== undefined) update_data.last_name = last_name;
    if (gender !== undefined) update_data.gender = gender;
    if (phone !== undefined) update_data.phone = phone;

    const next_first =
      first_name !== undefined ? String(first_name).trim() : undefined;
    const next_last =
      last_name !== undefined ? String(last_name).trim() : undefined;

    if (next_first !== undefined || next_last !== undefined) {
      update_data.name = `${next_first || ""} ${next_last || ""}`.trim();
    }

    const user = await User.findByIdAndUpdate(
      user_id,
      update_data,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (file) {
      const { path, public_id } = await upload_file(file.path);

      if (user.profile_image) {
        await delete_file(user.profile_image.public_id);
      }

      user.profile_image = { path, public_id };
      await user.save();
    }

    res.status(201).json({
      message: "profile updated",
      status: "success",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};