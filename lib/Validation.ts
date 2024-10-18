import { z } from 'zod';

export const RegisterFormValidation = z.object({
  name: z.string()
    .min(2, "Username must be at least 2 characters.")
    .max(50, "Username must be at most 50 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .max(50, "Password must be at most 50 characters.")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Password must contain at least one uppercase letter."
    )
    .refine(
      (password) => /[a-z]/.test(password),
      "Password must contain at least one lowercase letter."
    )
    .refine(
      (password) => /\d/.test(password),
      "Password must contain at least one number."
    )
    .refine(
      (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      "Password must contain at least one special character."
    ),
});


export const LoginFormValidation = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string()
    .min(8, "Password must be at least 8 characters.")
    .max(50, "Password must be at most 50 characters.")
    .refine(
      (password) => /[A-Z]/.test(password),
      "Password must contain at least one uppercase letter."
    )
    .refine(
      (password) => /[a-z]/.test(password),
      "Password must contain at least one lowercase letter."
    )
    .refine(
      (password) => /\d/.test(password),
      "Password must contain at least one number."
    )
    .refine(
      (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
      "Password must contain at least one special character."
    ),
});


export const EditFormValidation = z.object({
  name: z.string()
    .min(2, "Username must be at least 2 characters.")
    .max(50, "Username must be at most 50 characters."),
  email: z.string().email("Invalid email address."),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Invalid phone number"),
});


export const AMAAskFormValidation = z.object({
  question: z.string()
    .min(2, "Question must be at least 2 characters.")
    .max(250, "Question must be at most 50 characters."),
  description: z.string()
});

