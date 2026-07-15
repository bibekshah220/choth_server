import mongoose, { Schema, Document, Model } from "mongoose";
import { Gender, Role } from "../config/constants.js";

export interface IUser extends Document {
  name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  phone?: string;
  profile_image?: { path: string; public_id: string };
  role: Role;
  gender: Gender;
  token_version: number;
  login_attempts: number;
  lock_until: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: [true, "Name is required"] },
    first_name: { type: String },
    last_name: { type: String },
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
    token_version: { type: Number, default: 0 },
    login_attempts: { type: Number, default: 0 },
    lock_until: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.pre("validate", function () {
  if (!this.first_name && this.name) {
    this.first_name = this.name.trim().split(" ")[0] || this.name;
  }

  if (!this.last_name && this.name) {
    const parts = this.name.trim().split(" ");
    this.last_name = parts.slice(1).join(" ") || this.first_name || this.name;
  }
});

export const user: Model<IUser> = mongoose.model<IUser>("User", userSchema);
const User = user;
export default User;