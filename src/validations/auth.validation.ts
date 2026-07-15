import { z } from "zod";
import { Gender } from "../config/constants.js";

const password_regex =
	/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;

export const signup_schema = z.object({
	first_name: z.string().trim().min(2, "First name is required").max(50),
	last_name: z.string().trim().min(2, "Last name is required").max(50),
	email: z.string().trim().email("Invalid email address").toLowerCase(),
	password: z
		.string()
		.regex(
			password_regex,
			"Password must be 8-64 chars with uppercase, lowercase, number, and special character"
		),
	phone: z.string().trim().min(7).max(20).optional(),
	gender: z.nativeEnum(Gender),
});

export const login_schema = z.object({
	email: z.string().trim().email("Invalid email address").toLowerCase(),
	password: z.string().min(1, "Password is required"),
});

export type SignupInput = z.infer<typeof signup_schema>;
export type LoginInput = z.infer<typeof login_schema>;
