import type { Response, NextFunction } from "express";
import { AppError } from "../middlewares/error-handler.middleware.js";
import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { OrderStatus } from "../config/constants.js";
import type { AuthenticatedRequest } from "../types/index.js";
import { get_pagination, build_paginated_result } from "../utils/pagination.utils.js";

const get_authenticated_user_id = (req: AuthenticatedRequest): string => {
  if (!req.user?._id) {
    throw new AppError("Unauthorized. Access denied.", 401);
  }
  return req.user._id;
};

// * create review (user must have purchased/delivered product)
export const createReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { product_id, rating, comment } = req.body;

    if (!product_id) {
      throw new AppError("Product ID is required", 400);
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      throw new AppError("Rating must be between 1 and 5", 400);
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    // Check if user has a delivered order containing this product
    const delivered_order = await Order.findOne({
      user: user_id,
      status: OrderStatus.DELIVERED,
      "items.product": product_id,
    });

    if (!delivered_order) {
      throw new AppError(
        "You can only review products you have purchased and received",
        403
      );
    }

    const existing_review = await Review.findOne({
      user: user_id,
      product: product_id,
    });

    if (existing_review) {
      throw new AppError("You have already reviewed this product", 409);
    }

    const review = await Review.create({
      user: user_id,
      product: product_id,
      rating,
      comment: comment?.trim() || undefined,
    });

    const populated_review = await Review.findById(review._id).populate(
      "user",
      "first_name last_name"
    );

    res.status(201).json({
      message: "review created",
      status: "success",
      data: populated_review,
    });
  } catch (error) {
    next(error);
  }
};

// * get reviews for a product
export const getProductReviews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { product_id } = req.params;
    const { page, limit, skip } = get_pagination(req);

    const product = await Product.findById(product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const [reviews, total] = await Promise.all([
      Review.find({ product: product_id })
        .populate("user", "first_name last_name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments({ product: product_id }),
    ]);

    // Calculate average rating
    const rating_result = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: null,
          average_rating: { $avg: "$rating" },
          total_reviews: { $sum: 1 },
        },
      },
    ]);

    const stats = rating_result[0] || { average_rating: 0, total_reviews: 0 };

    res.status(200).json({
      message: "product reviews fetched",
      status: "success",
      data: {
        ...build_paginated_result(reviews, total, page, limit),
        average_rating: Math.round((stats.average_rating || 0) * 10) / 10,
        total_reviews: stats.total_reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// * get user's reviews
export const getMyReviews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { page, limit, skip } = get_pagination(req);

    const [reviews, total] = await Promise.all([
      Review.find({ user: user_id })
        .populate("product", "name images")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments({ user: user_id }),
    ]);

    res.status(200).json({
      message: "user reviews fetched",
      status: "success",
      data: build_paginated_result(reviews, total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// * update review
export const updateReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { review_id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(review_id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (String(review.user) !== user_id) {
      throw new AppError("Forbidden. You can only edit your own reviews.", 403);
    }

    if (rating !== undefined) {
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        throw new AppError("Rating must be between 1 and 5", 400);
      }
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment?.trim() || undefined;
    }

    await review.save();

    const populated_review = await Review.findById(review._id)
      .populate("user", "first_name last_name")
      .populate("product", "name images");

    res.status(200).json({
      message: "review updated",
      status: "success",
      data: populated_review,
    });
  } catch (error) {
    next(error);
  }
};

// * delete review
export const deleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { review_id } = req.params;

    const review = await Review.findById(review_id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    if (String(review.user) !== user_id) {
      throw new AppError("Forbidden. You can only delete your own reviews.", 403);
    }

    await review.deleteOne();

    res.status(200).json({
      message: "review deleted",
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

// * get all reviews (admin)
export const getAllReviews = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = get_pagination(req);

    const [reviews, total] = await Promise.all([
      Review.find({})
        .populate("user", "first_name last_name email")
        .populate("product", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments({}),
    ]);

    res.status(200).json({
      message: "all reviews fetched",
      status: "success",
      data: build_paginated_result(reviews, total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};

// * admin delete review
export const adminDeleteReview = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { review_id } = req.params;

    const review = await Review.findById(review_id);
    if (!review) {
      throw new AppError("Review not found", 404);
    }

    await review.deleteOne();

    res.status(200).json({
      message: "review deleted by admin",
      status: "success",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};
