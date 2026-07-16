import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWishlist extends Document {
  user: Types.ObjectId;
  products: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
      unique: true,
    },
    products: [{ type: Schema.Types.ObjectId, ref: "product" }],
  },
  { timestamps: true }
);

const Wishlist: Model<IWishlist> = mongoose.model<IWishlist>(
  "wishlist",
  wishlistSchema
);
export default Wishlist;
