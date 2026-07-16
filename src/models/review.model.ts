import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: { type: Schema.Types.ObjectId, ref: "user", required: true },
    product: { type: Schema.Types.ObjectId, ref: "product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review: Model<IReview> = mongoose.model<IReview>("review", reviewSchema);
export default Review;
