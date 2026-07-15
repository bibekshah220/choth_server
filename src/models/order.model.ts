import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { OrderStatus, PaymentStatus } from "../config/constants.js";

export interface IOrderItem {
  product: Types.ObjectId;
  name: string;
  size: string;
  quantity: number;
  price: number;
}

export interface IShippingAddress {
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
}

export interface IOrder extends Document {
  user: Types.ObjectId;
  items: IOrderItem[];
  shipping_address: IShippingAddress;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "product", required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    postal_code: { type: String },
    country: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    items: { type: [orderItemSchema], required: true },
    shipping_address: { type: shippingAddressSchema, required: true },
    total_amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    payment_status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.model<IOrder>("order", orderSchema);
export default Order;