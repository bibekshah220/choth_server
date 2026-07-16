import { z } from "zod";

const password_schema = z
	.string()
	.min(8, "Password must be at least 8 characters long")
	.regex(/[a-z]/, "At least one lowercase letter required")
	.regex(/[A-Z]/, "At least one uppercase letter required")
	.regex(/[0-9]/, "At least one number required")
	.regex(/[@$!%*?&]/, "At least one special character required");

export const signup_schema = z
	.object({
		name: z.string().trim().min(3, "Name must be at least 3 characters long"),
		email: z.string().trim().email("Invalid email address").toLowerCase(),
		password: password_schema,
		confirm_password: z.string(),
	})
	.refine((data) => data.password === data.confirm_password, {
		message: "Passwords do not match",
		path: ["confirm_password"],
	});

export const login_schema = z.object({
	email: z.string().trim().email("Invalid email address").toLowerCase(),
	password: password_schema,
});

// Aliases matching common naming conventions
export const registerSchema = signup_schema;
export const loginSchema = login_schema;

export type SignupInput = z.infer<typeof signup_schema>;
export type LoginInput = z.infer<typeof login_schema>;
