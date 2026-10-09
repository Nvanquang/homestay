import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*[0-9])/;
const PHONE_REGEX = /^(\+?[0-9]{9,15})?$/;

/**
 * Validation schema for User Profile (C01).
 */
export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ và tên (2–80 ký tự)")
    .max(80, "Họ và tên không được vượt quá 80 ký tự"),
  phone: z
    .string()
    .trim()
    .regex(PHONE_REGEX, "Số điện thoại không đúng định dạng (9–15 số)")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(300, "Tiểu sử không được vượt quá 300 ký tự")
    .optional()
    .or(z.literal("")),
  language: z.enum(["vi", "en"]),
  displayCurrency: z.enum(["VND", "USD", "EUR", "JPY", "GBP"]),
});

export type ProfileInput = z.infer<typeof profileSchema>;

/**
 * Validation schema for Change Password (C02).
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ và số")
      .max(128, "Mật khẩu mới không được vượt quá 128 ký tự")
      .regex(PASSWORD_REGEX, "Mật khẩu mới cần ít nhất 8 ký tự, gồm chữ và số"),
    confirmPassword: z
      .string()
      .min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu nhập lại chưa khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Validation schema for Notification Settings (C02).
 */
export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  bookingUpdates: z.boolean(),
  promoOffers: z.boolean(),
});

export type NotificationSettingsInput = z.infer<typeof notificationSettingsSchema>;
