import { z } from "zod";

export const signupSchema = z.object({
    email: z.string()
        .email("Invalid email format")
        .toLowerCase()
        .trim(),
    name: z.string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .trim(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
    phone: z.string()
        .min(10, "Phone must be at least 10 characters")
        .max(15, "Phone must be less than 15 characters")
        .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
        .trim()
});
