import type { Response, NextFunction } from "express";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Review from "../models/review.model.js";
import { OrderStatus, PaymentStatus, Role } from "../config/constants.js";
import type { AuthenticatedRequest } from "../types/index.js";

const LOW_STOCK_THRESHOLD = 10;

// * get dashboard stats (admin)
export const getDashboardStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Parallel queries for performance
    const [
      total_users,
      total_products,
      total_categories,
      total_orders,
      total_reviews,
      order_stats,
      revenue_stats,
      low_stock_products,
      recent_orders,
      top_selling_products,
    ] = await Promise.all([
      // Count users (excluding admins)
      User.countDocuments({ role: Role.USER }),

      // Count products
      Product.countDocuments({}),

      // Count categories
      Category.countDocuments({}),

      // Count total orders
      Order.countDocuments({}),

      // Count reviews
      Review.countDocuments({}),

      // Order status breakdown
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Revenue stats (from delivered and paid orders)
      Order.aggregate([
        {
          $match: {
            status: OrderStatus.DELIVERED,
            payment_status: PaymentStatus.PAID,
          },
        },
        {
          $group: {
            _id: null,
            total_revenue: { $sum: "$total_amount" },
            order_count: { $sum: 1 },
          },
        },
      ]),

      // Low stock products
      Product.find({
        $or: [
          { total_stock: { $lte: LOW_STOCK_THRESHOLD } },
          { is_available: false },
        ],
      })
        .select("name total_stock is_available images")
        .limit(10)
        .sort({ total_stock: 1 }),

      // Recent orders
      Order.find({})
        .populate("user", "first_name last_name email")
        .select("total_amount status payment_status createdAt")
        .sort({ createdAt: -1 })
        .limit(10),

      // Top selling products (by order count)
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            total_sold: { $sum: "$items.quantity" },
            total_revenue: {
              $sum: { $multiply: ["$items.price", "$items.quantity"] },
            },
          },
        },
        { $sort: { total_sold: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 1,
            total_sold: 1,
            total_revenue: 1,
            name: "$product.name",
            images: "$product.images",
          },
        },
      ]),
    ]);

    // Build order status map
    const order_status_map: Record<string, number> = {};
    for (const status of Object.values(OrderStatus)) {
      order_status_map[status] = 0;
    }
    for (const stat of order_stats) {
      order_status_map[stat._id] = stat.count;
    }

    const revenue = revenue_stats[0] || { total_revenue: 0, order_count: 0 };

    res.status(200).json({
      message: "dashboard stats fetched",
      status: "success",
      data: {
        overview: {
          total_users,
          total_products,
          total_categories,
          total_orders,
          total_reviews,
          total_revenue: revenue.total_revenue,
          completed_orders: revenue.order_count,
        },
        order_status_breakdown: order_status_map,
        low_stock_products,
        recent_orders,
        top_selling_products,
      },
    });
  } catch (error) {
    next(error);
  }
};

// * get sales analytics (admin)
export const getSalesAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { period = "30" } = req.query;
    const days = Math.min(Math.max(Number(period) || 30, 1), 365);

    const start_date = new Date();
    start_date.setDate(start_date.getDate() - days);
    start_date.setHours(0, 0, 0, 0);

    // Daily sales for the period
    const daily_sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start_date },
          status: { $ne: OrderStatus.CANCELLED },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          total_amount: { $sum: "$total_amount" },
          order_count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          total_amount: 1,
          order_count: 1,
        },
      },
    ]);

    // Category-wise sales
    const category_sales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start_date },
          status: OrderStatus.DELIVERED,
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.product",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category._id",
          category_name: { $first: "$category.name" },
          total_sold: { $sum: "$items.quantity" },
          total_revenue: {
            $sum: { $multiply: ["$items.price", "$items.quantity"] },
          },
        },
      },
      { $sort: { total_revenue: -1 } },
    ]);

    res.status(200).json({
      message: "sales analytics fetched",
      status: "success",
      data: {
        period_days: days,
        daily_sales,
        category_sales,
      },
    });
  } catch (error) {
    next(error);
  }
};
