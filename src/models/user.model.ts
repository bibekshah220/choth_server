import mongoose, { Schema, Document, Model } from "mongoose";
import { Gender, Role } from "../config/constants.js";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  profile_image?: { path: string; public_id: string };
  role: Role;
  gender: Gender;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: [true, "First Name is required"] },
    last_name: { type: String, required: [true, "Last Name is required"] },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    phone: { type: String },
    profile_image: {
      path: { type: String },
      public_id: { type: String },
    },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: Gender.MALE,
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model<IUser>("user", userSchema);
export default User;