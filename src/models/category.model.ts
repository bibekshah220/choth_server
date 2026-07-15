import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  description?: string;
  image?: { path: string; public_id: string };
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
    },
    description: { type: String },
    image: {
      path: { type: String },
      public_id: { type: String },
    },
  },
  { timestamps: true }
);

const Category: Model<ICategory> = mongoose.model<ICategory>(
  "category",
  categorySchema
);
export default Category;