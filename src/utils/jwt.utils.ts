import jwt from "jsonwebtoken";
import { jwt_config } from "../config/config.js";
import type { Role } from "../config/constants.js";
import type { JwtPayload } from "../types/index.js";

interface SignTokenPayload {
  _id: string;
  email: string;
  role: Role;
  token_version: number;
}

export const sign_token = (payload: SignTokenPayload): string => {
  return jwt.sign(payload, jwt_config.jwt_secret, {
    expiresIn: jwt_config.expires_in,
  } as jwt.SignOptions);
};

export const verify_token = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, jwt_config.jwt_secret) as JwtPayload;
  } catch {
    return null;
  }
};