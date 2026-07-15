import type { Response, NextFunction } from "express";
import type { Types } from "mongoose";
import { AppError } from "../middlewares/error-handler.middleware.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import type { AuthenticatedRequest } from "../types/index.js";
import { OrderStatus, Role } from "../config/constants.js";

interface CartItemInput {
	product_id: string;
	size: string;
	quantity: number;
}

interface ShippingAddressInput {
	full_name: string;
	phone: string;
	street: string;
	city: string;
	state?: string;
	postal_code?: string;
	country: string;
}

const get_authenticated_user_id = (req: AuthenticatedRequest): string => {
	if (!req.user?._id) {
		throw new AppError("Unauthorized. Access denied.", 401);
	}

	return req.user._id;
};

const is_shipping_address = (
	value: unknown
): value is ShippingAddressInput => {
	if (!value || typeof value !== "object") {
		return false;
	}

	const candidate = value as Record<string, unknown>;

	return (
		typeof candidate.full_name === "string" &&
		typeof candidate.phone === "string" &&
		typeof candidate.street === "string" &&
		typeof candidate.city === "string" &&
		typeof candidate.country === "string"
	);
};

// * create order (user)
export const create = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const user_id = get_authenticated_user_id(req);

		const { items, shipping_address } = req.body as {
			items: CartItemInput[];
			shipping_address: unknown;
		};

		if (!Array.isArray(items) || items.length === 0) {
			throw new AppError("Order must contain at least one item", 400);
		}

		if (!is_shipping_address(shipping_address)) {
			throw new AppError("Invalid shipping address", 400);
		}

		const order_items: Array<{
			product: Types.ObjectId;
			name: string;
			size: string;
			quantity: number;
			price: number;
		}> = [];
		let total_amount = 0;

		for (const item of items) {
			const product = await Product.findById(item.product_id);
			if (!product) {
				throw new AppError(`Product not found: ${item.product_id}`, 404);
			}

			const size_entry = product.sizes.find((s) => s.size === item.size);
			if (!size_entry || size_entry.stock < item.quantity) {
				throw new AppError(
					`Insufficient stock for ${product.name} (size ${item.size})`,
					400
				);
			}

			const unit_price =
				product.is_offer_active && product.offer_price
					? product.offer_price
					: product.price;

			order_items.push({
				product: product._id,
				name: product.name,
				size: item.size,
				quantity: item.quantity,
				price: unit_price,
			});

			total_amount += unit_price * item.quantity;

			
			size_entry.stock -= item.quantity;
			await product.save();
		}

		const order = await Order.create({
			user: user_id,
			items: order_items,
			shipping_address,
			total_amount,
		});

		res.status(201).json({
			message: "order placed",
			status: "success",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// * get logged-in user's orders
export const getMyOrders = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const user_id = get_authenticated_user_id(req);

		const orders = await Order.find({ user: user_id }).sort({
			createdAt: -1,
		});

		res.status(200).json({
			message: "orders fetched",
			status: "success",
			data: orders,
		});
	} catch (error) {
		next(error);
	}
};

// * get all orders (admin)
export const getAll = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const orders = await Order.find({})
			.populate("user", "first_name last_name email")
			.sort({ createdAt: -1 });

		res.status(200).json({
			message: "all orders fetched",
			status: "success",
			data: orders,
		});
	} catch (error) {
		next(error);
	}
};

// * get order by id
export const getById = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const user_id = get_authenticated_user_id(req);
		const { order_id } = req.params;

		const order = await Order.findById(order_id).populate(
			"user",
			"first_name last_name email"
		);

		if (!order) {
			throw new AppError("Order not found", 404);
		}

		const populated_user = order.user as unknown as { _id?: unknown };
		const owner_id = populated_user?._id
			? String(populated_user._id)
			: String(order.user);

		const is_owner = owner_id === user_id;
		if (!is_owner && req.user?.role !== Role.ADMIN) {
			throw new AppError("Forbidden. Access denied.", 403);
		}

		res.status(200).json({
			message: "order fetched",
			status: "success",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// * update order status (admin)
export const updateStatus = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const { order_id } = req.params;
		const { status } = req.body as { status: OrderStatus };

		if (!Object.values(OrderStatus).includes(status)) {
			throw new AppError("Invalid order status", 400);
		}

		const order = await Order.findByIdAndUpdate(
			order_id,
			{ status },
			{ new: true, runValidators: true }
		);

		if (!order) {
			throw new AppError("Order not found", 404);
		}

		res.status(200).json({
			message: "order status updated",
			status: "success",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};

// * cancel order (user, only if pending)
export const cancel = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction
): Promise<void> => {
	try {
		const user_id = get_authenticated_user_id(req);
		const { order_id } = req.params;
		const order = await Order.findById(order_id);

		if (!order) {
			throw new AppError("Order not found", 404);
		}

		if (String(order.user) !== user_id) {
			throw new AppError("Forbidden. Access denied.", 403);
		}

		if (order.status !== OrderStatus.PENDING) {
			throw new AppError("Only pending orders can be cancelled", 400);
		}

		order.status = OrderStatus.CANCELLED;
		await order.save();

		res.status(200).json({
			message: "order cancelled",
			status: "success",
			data: order,
		});
	} catch (error) {
		next(error);
	}
};
