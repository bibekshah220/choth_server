import type { Response, NextFunction } from "express";
import { AppError } from "../middlewares/error-handler.middleware.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import type { AuthenticatedRequest } from "../types/index.js";

const get_authenticated_user_id = (req: AuthenticatedRequest): string => {
  if (!req.user?._id) {
    throw new AppError("Unauthorized. Access denied.", 401);
  }
  return req.user._id;
};

// * get user's cart
export const getCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);

    let cart = await Cart.findOne({ user: user_id }).populate({
      path: "items.product",
      select: "name images price offer_price is_offer_active sizes is_available",
    });

    if (!cart) {
      cart = await Cart.create({ user: user_id, items: [] });
    }

    res.status(200).json({
      message: "cart fetched",
      status: "success",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

// * add item to cart
export const addItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { product_id, size, quantity = 1 } = req.body;

    if (!product_id || !size) {
      throw new AppError("Product ID and size are required", 400);
    }

    if (typeof quantity !== "number" || quantity < 1) {
      throw new AppError("Quantity must be at least 1", 400);
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const size_entry = product.sizes.find((s) => s.size === size);
    if (!size_entry) {
      throw new AppError("Invalid size for this product", 400);
    }

    if (size_entry.stock < quantity) {
      throw new AppError("Insufficient stock for requested quantity", 400);
    }

    let cart = await Cart.findOne({ user: user_id });
    if (!cart) {
      cart = await Cart.create({ user: user_id, items: [] });
    }

    const existing_index = cart.items.findIndex(
      (item) => String(item.product) === product_id && item.size === size
    );

    if (existing_index > -1) {
      const new_qty = cart.items[existing_index].quantity + quantity;
      if (new_qty > size_entry.stock) {
        throw new AppError("Insufficient stock for requested quantity", 400);
      }
      cart.items[existing_index].quantity = new_qty;
    } else {
      cart.items.push({ product: product._id, size, quantity });
    }

    await cart.save();

    const populated_cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name images price offer_price is_offer_active sizes is_available",
    });

    res.status(200).json({
      message: "item added to cart",
      status: "success",
      data: populated_cart,
    });
  } catch (error) {
    next(error);
  }
};

// * update item quantity
export const updateItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { product_id, size, quantity } = req.body;

    if (!product_id || !size) {
      throw new AppError("Product ID and size are required", 400);
    }

    if (typeof quantity !== "number" || quantity < 1) {
      throw new AppError("Quantity must be at least 1", 400);
    }

    const product = await Product.findById(product_id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const size_entry = product.sizes.find((s) => s.size === size);
    if (!size_entry || size_entry.stock < quantity) {
      throw new AppError("Insufficient stock for requested quantity", 400);
    }

    const cart = await Cart.findOne({ user: user_id });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item_index = cart.items.findIndex(
      (item) => String(item.product) === product_id && item.size === size
    );

    if (item_index === -1) {
      throw new AppError("Item not found in cart", 404);
    }

    cart.items[item_index].quantity = quantity;
    await cart.save();

    const populated_cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name images price offer_price is_offer_active sizes is_available",
    });

    res.status(200).json({
      message: "cart item updated",
      status: "success",
      data: populated_cart,
    });
  } catch (error) {
    next(error);
  }
};

// * remove item from cart
export const removeItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);
    const { product_id, size } = req.body;

    if (!product_id || !size) {
      throw new AppError("Product ID and size are required", 400);
    }

    const cart = await Cart.findOne({ user: user_id });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item_index = cart.items.findIndex(
      (item) => String(item.product) === product_id && item.size === size
    );

    if (item_index === -1) {
      throw new AppError("Item not found in cart", 404);
    }

    cart.items.splice(item_index, 1);
    await cart.save();

    const populated_cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      select: "name images price offer_price is_offer_active sizes is_available",
    });

    res.status(200).json({
      message: "item removed from cart",
      status: "success",
      data: populated_cart,
    });
  } catch (error) {
    next(error);
  }
};

// * clear cart
export const clearCart = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user_id = get_authenticated_user_id(req);

    const cart = await Cart.findOne({ user: user_id });
    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      message: "cart cleared",
      status: "success",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};
