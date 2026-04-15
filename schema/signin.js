import { z } from "zod";

export const signinSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
    password: z.string()
        .min(1, "Password is required")
        .max(100, "Password must be less than 100 characters")
});