import { Response, NextFunction } from "express";
import { AppError } from "../middlewares/error-handler.middleware.js";
import Category from "../models/category.model.js";
import { delete_file, upload_file } from "../utils/cloudinary.utils.js";
import { AuthenticatedRequest } from "../types/index.js";

// * create category (admin)
export const create = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const raw_name = req.body.name;
    const raw_description = req.body.description;
    const file = req.file;

    const name = typeof raw_name === "string" ? raw_name.trim() : "";
    const description =
      typeof raw_description === "string" ? raw_description.trim() : "";

    if (!name || !description) {
      throw new AppError("Name and description are required", 400);
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      throw new AppError("Category already exists", 409);
    }

    let image: { path: string; public_id: string } | undefined;
    if (file) {
      const { path, public_id } = await upload_file(file.path, "categories");
      image = { path, public_id };
    }

    const category_data: {
      name: string;
      description: string;
      image?: { path: string; public_id: string };
    } = { name, description };

    if (image) {
      category_data.image = image;
    }

    const category = await Category.create(category_data);

    res.status(201).json({
      message: "category created",
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// * get all categories
export const getAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find({});

    res.status(200).json({
      message: "all categories fetched",
      status: "success",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

// * get category by id
export const getById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category_id } = req.params;
    const category = await Category.findById(category_id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    res.status(200).json({
      message: "category fetched",
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// * update category (admin)
export const update = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category_id } = req.params;
    const { name, description } = req.body;
    const file = req.file;

    const category = await Category.findById(category_id);
    if (!category) {
      throw new AppError("Category not found", 404);
    }

    category.name = name ?? category.name;
    category.description = description ?? category.description;

    if (file) {
      const { path, public_id } = await upload_file(file.path, "categories");

      if (category.image) {
        await delete_file(category.image.public_id);
      }

      category.image = { path, public_id };
    }

    await category.save();

    res.status(200).json({
      message: "category updated",
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// * delete category (admin)
export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category_id } = req.params;
    const category = await Category.findById(category_id);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    if (category.image) {
      await delete_file(category.image.public_id);
    }

    await category.deleteOne();

    res.status(200).json({
      message: "category deleted successfully",
      status: "success",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};