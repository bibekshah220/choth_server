import type { Response, NextFunction } from "express";
import { AppError } from "../middlewares/error-handler.middleware.js";
import Wishlist from "../models/wishlist.model.js";
import Product from "../models/product.model.js";
import type { AuthenticatedRequest } from "../types/index.js";

const get_authenticated_user_id = (req: AuthenticatedRequest): string => {
  if (!req.user?._id) {
    throw new AppError("Unauthorized. Access denied.", 401);
  }
  return req.user._id;
};

// * get user's wishlist
export const getWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);

    let wishlist = await Wishlist.findOne({ user: user_id }).populate({
      path: "products",
      select: "name images price offer_price is_offer_active is_available",
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: user_id, products: [] });
    }

    res.status(200).json({
      message: "wishlist fetched",
      status: "success",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// * add product to wishlist
export const addToWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { product_id } = req.body;

    if (!product_id) {
      throw new AppError("Product ID is required", 400);
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    let wishlist = await Wishlist.findOne({ user: user_id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: user_id, products: [] });
    }

    const already_exists = wishlist.products.some(
      (p) => String(p) === product_id
    );

    if (already_exists) {
      throw new AppError("Product already in wishlist", 409);
    }

    wishlist.products.push(product._id);
    await wishlist.save();

    const populated_wishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products",
      select: "name images price offer_price is_offer_active is_available",
    });

    res.status(200).json({
      message: "product added to wishlist",
      status: "success",
      data: populated_wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// * remove product from wishlist
export const removeFromWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { product_id } = req.params;

    if (!product_id) {
      throw new AppError("Product ID is required", 400);
    }

    const wishlist = await Wishlist.findOne({ user: user_id });
    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    const product_index = wishlist.products.findIndex(
      (p) => String(p) === product_id
    );

    if (product_index === -1) {
      throw new AppError("Product not found in wishlist", 404);
    }

    wishlist.products.splice(product_index, 1);
    await wishlist.save();

    const populated_wishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products",
      select: "name images price offer_price is_offer_active is_available",
    });

    res.status(200).json({
      message: "product removed from wishlist",
      status: "success",
      data: populated_wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// * clear wishlist
export const clearWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);

    const wishlist = await Wishlist.findOne({ user: user_id });
    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({
      message: "wishlist cleared",
      status: "success",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};
