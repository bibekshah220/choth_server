import { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/error-handler.middleware.js";
import User from "../models/user.model.js";
import { hash_password, compare_passwords } from "../utils/bcrypt.utils.js";
import { sign_token } from "../utils/jwt.utils.js";
import { Role } from "../config/constants.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// * register user
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { first_name, last_name, email, password, phone, gender } =
      req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("User with provided email already exists", 409);
    }

    const hashed = await hash_password(password);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashed,
      phone,
      gender,
      role: Role.USER,
    });

    res.status(201).json({
      message: "signup successful",
      status: "success",
      data: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// * login user
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    const is_match = await compare_passwords(password, user.password);
    if (!is_match) {
      throw new AppError("Invalid email or password", 401);
    }

    const token = sign_token({
      _id: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie("access_token", token, COOKIE_OPTIONS);

    res.status(200).json({
      message: "login successful",
      status: "success",
      data: {
        _id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// * logout user
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    res.clearCookie("access_token", COOKIE_OPTIONS);
    res.status(200).json({
      message: "logout successful",
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};