import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AppError } from "../middlewares/error-handler.middleware.js";
import User from "../models/user.model.js";
import type { IUser } from "../models/user.model.js";
import type { HydratedDocument } from "mongoose";
import { hash_password, compare_passwords } from "../utils/bcrypt.utils.js";
import { sign_token } from "../utils/jwt.utils.js";
import { Role } from "../config/constants.js";
import { login_schema, signup_schema } from "../validations/auth.validation.js";
import type { AuthenticatedRequest } from "../types/index.js";
import { send_email } from "../utils/mail.utils.js";
import { getOtpHtml, getVerifyEmailHtml } from "../config/html.js";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 15 * 60 * 1000;

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password";

type UserDoc = HydratedDocument<IUser>;

const APP_NAME = process.env.APP_NAME || "Authentication App";

const send_email_safe = async (
  to: string,
  subject: string,
  html: string
): Promise<void> => {
  try {
    await send_email({ to, subject, html });
  } catch (error) {
    console.error("Email sending failed", error);
  }
};

const increment_login_failures = async (
  user: UserDoc
): Promise<void> => {
  const next_attempts = (user.login_attempts || 0) + 1;

  user.login_attempts = next_attempts;
  if (next_attempts >= MAX_LOGIN_ATTEMPTS) {
    user.lock_until = new Date(Date.now() + LOCK_TIME_MS);
  }

  await user.save();
};

const reset_login_failures = async (
  user: UserDoc
): Promise<void> => {
  if (user.login_attempts === 0 && !user.lock_until) {
    return;
  }

  user.login_attempts = 0;
  user.lock_until = null;
  await user.save();
};

// * register user
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsed = signup_schema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message || "Invalid request body", 400);
    }

    const { name, email, password } = parsed.data;

    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("User with provided email already exists", 409);
    }

    const hashed = await hash_password(password);

    const user_data: {
      name: string;
      email: string;
      password: string;
      role: Role;
    } = {
      name,
      email,
      password: hashed,
      role: Role.USER,
    };

    const user = await User.create(user_data);

    const verify_token = crypto.randomBytes(24).toString("hex");
    const verify_html = getVerifyEmailHtml({
      email: user.email,
      token: verify_token,
    });

    await send_email_safe(
      user.email,
      `${APP_NAME} - Verify your account`,
      verify_html
    );

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
    const parsed = login_schema.safeParse(req.body);
    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0]?.message || "Invalid request body", 400);
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    if (user.lock_until && user.lock_until.getTime() > Date.now()) {
      throw new AppError("Too many failed login attempts. Try again later.", 429);
    }

    if (user.lock_until && user.lock_until.getTime() <= Date.now()) {
      user.lock_until = null;
      user.login_attempts = 0;
      await user.save();
    }

    const is_match = await compare_passwords(password, user.password);
    if (!is_match) {
      await increment_login_failures(user);
      throw new AppError(INVALID_CREDENTIALS_MESSAGE, 401);
    }

    await reset_login_failures(user);

    const token = sign_token({
      _id: String(user._id),
      email: user.email,
      role: user.role,
      token_version: user.token_version,
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp_html = getOtpHtml({ email: user.email, otp });

    await send_email_safe(
      user.email,
      `${APP_NAME} - Login security code`,
      otp_html
    );

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
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (req.user?._id) {
      await User.updateOne(
        { _id: req.user._id },
        { $inc: { token_version: 1 } }
      );
    }

    res.clearCookie("access_token", COOKIE_OPTIONS);
    res.status(200).json({
      message: "logout successful",
      status: "success",
    });
  } catch (error) {
    next(error);
  }
};