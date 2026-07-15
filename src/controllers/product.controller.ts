import { Response, NextFunction } from "express";
import { AppError } from "../middlewares/error-handler.middleware.js";
import Product from "../models/product.model.js";
import { delete_file, upload_file } from "../utils/cloudinary.utils.js";
import { AuthenticatedRequest } from "../types/index.js";
import { get_pagination, build_paginated_result } from "../utils/pagination.utils.js";

// * create product (admin only)
export const create = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, category, price, offer_price, sizes } =
      req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      throw new AppError("At least one product image is required", 400);
    }

    let parsed_sizes;
    try {
      parsed_sizes =
        typeof sizes === "string" ? JSON.parse(sizes) : sizes;
    } catch {
      throw new AppError("Invalid sizes format. Expected JSON array.", 400);
    }

    if (!Array.isArray(parsed_sizes) || parsed_sizes.length === 0) {
      throw new AppError("At least one size with stock is required", 400);
    }

    if (!req.user?._id) {
      throw new AppError("Unauthorized. Access denied.", 401);
    }

    const uploaded_images = await Promise.all(
      files.map((file) => upload_file(file.path, "products"))
    );

    const product = await Product.create({
      name,
      description,
      category,
      price,
      offer_price: offer_price || undefined,
      sizes: parsed_sizes,
      images: uploaded_images,
      created_by: req.user._id,
    });

    res.status(201).json({
      message: "product created",
      status: "success",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// * get all products 
export const getAll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, search } = req.query;
    const { page, limit, skip } = get_pagination(req);

    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      message: "all products fetched",
      status: "success",
      data: build_paginated_result(products, total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// * get product by id (public)
export const getById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { product_id } = req.params;
    const product = await Product.findById(product_id).populate(
      "category",
      "name"
    );

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    res.status(200).json({
      message: "product fetched",
      status: "success",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// * update product (admin only)
export const update = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { product_id } = req.params;
    const { name, description, category, price, offer_price, sizes } =
      req.body;
    const files = req.files as Express.Multer.File[] | undefined;

    const product = await Product.findById(product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (category) product.category = category;
    if (price) product.price = price;
    if (offer_price !== undefined) product.offer_price = offer_price;

    if (sizes) {
      try {
        product.sizes =
          typeof sizes === "string" ? JSON.parse(sizes) : sizes;
      } catch {
        throw new AppError("Invalid sizes format. Expected JSON array.", 400);
      }
    }

    if (files && files.length > 0) {
      // remove old images from cloudinary
      await Promise.all(
        product.images.map((img) => delete_file(img.public_id))
      );

      const uploaded_images = await Promise.all(
        files.map((file) => upload_file(file.path, "products"))
      );
      product.images = uploaded_images;
    }

    await product.save();

    res.status(200).json({
      message: "product updated",
      status: "success",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// * delete product (admin only)
export const remove = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { product_id } = req.params;
    const product = await Product.findById(product_id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    await Promise.all(
      product.images.map((img) => delete_file(img.public_id))
    );

    await product.deleteOne();

    res.status(200).json({
      message: "product deleted successfully",
      status: "success",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};