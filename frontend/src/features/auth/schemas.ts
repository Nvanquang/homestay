import { z } from "zod";

/**
 * Regex for password requiring at least one letter and at least one digit.
 */
const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])/;

/**
 * Validation schema for Login (P06).
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Email chưa đúng định dạng")
    .max(254, "Email không được vượt quá 254 ký tự")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu")
    .max(128, "Mật khẩu không được vượt quá 128 ký tự"),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Validation schema for Registration (P07).
 */
export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ và tên (2–80 ký tự)")
    .max(80, "Họ và tên không được vượt quá 80 ký tự"),
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Email chưa đúng định dạng")
    .max(254, "Email không được vượt quá 254 ký tự")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số")
    .max(128, "Mật khẩu không được vượt quá 128 ký tự")
    .regex(PASSWORD_REGEX, "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số"),
  acceptTerms: z.literal(true, {
    message: "Bạn cần đồng ý Điều khoản để tiếp tục",
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Validation schema for Forgot Password Step 1 (P08 B1).
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập địa chỉ email")
    .email("Email chưa đúng định dạng")
    .max(254, "Email không được vượt quá 254 ký tự")
    .toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/**
 * Validation schema for Reset Password Step 2 (P08 B2).
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số")
      .max(128, "Mật khẩu không được vượt quá 128 ký tự")
      .regex(PASSWORD_REGEX, "Mật khẩu cần ít nhất 8 ký tự, gồm chữ và số"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu nhập lại chưa khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
