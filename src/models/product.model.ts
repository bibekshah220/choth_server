import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface ISize {
  size: string;
  stock: number;
}

export interface IProductImage {
  path: string;
  public_id: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  category: Types.ObjectId;
  images: IProductImage[];
  price: number;
  offer_price?: number;
  is_offer_active: boolean;
  sizes: ISize[];
  total_stock: number;
  is_available: boolean;
  created_by: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const sizeSchema = new Schema<ISize>(
  {
    size: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false }
);

const imageSchema = new Schema<IProductImage>(
  {
    path: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: [true, "Name is required"], trim: true },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "category",
      required: [true, "Category is required"],
    },
    images: { type: [imageSchema], required: true },
    price: { type: Number, required: [true, "Price is required"], min: 0 },
    offer_price: { type: Number, min: 0 },
    is_offer_active: { type: Boolean, default: false },
    sizes: { type: [sizeSchema], required: true },
    total_stock: { type: Number, default: 0 },
    is_available: { type: Boolean, default: true },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function () {
  this.total_stock = this.sizes.reduce((sum, s) => sum + s.stock, 0);
  this.is_available = this.total_stock > 0;

  if (this.offer_price && this.offer_price > 0) {
    this.is_offer_active = this.offer_price < this.price;
  } else {
    this.is_offer_active = false;
  }
});

const Product: Model<IProduct> = mongoose.model<IProduct>(
  "product",
  productSchema
);
export default Product;