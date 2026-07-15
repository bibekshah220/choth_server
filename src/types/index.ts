import type { Request } from "express";
import { Role } from "../config/constants.js";

export interface JwtPayload {
  _id: string;
  email: string;
  role: Role;
  exp: number;
  iat: number;
}

export interface ReqUser {
  _id: string;
  email: string;
  role: Role;
  first_name: string;
  last_name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: ReqUser;
}

export interface ApiResponse<T = unknown> {
  message: string;
  status: "success" | "error";
  data?: T;
}