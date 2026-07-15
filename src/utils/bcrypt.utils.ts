import bcrypt from "bcryptjs";
import { AppError } from "../middlewares/error-handler.middleware.js";

export const hash_password = async (password: string): Promise<string> => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new AppError("Internal Server Error", 500);
  }
};

export const compare_passwords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};