import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Định dạng email không hợp lệ"),
  password: z
    .string()
    .min(1, "Vui lòng nhập mật khẩu"),
});

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

export const createStaffSchema = z.object({
  fullName: z
    .string()
    .min(2, "Họ và tên tối thiểu 2 ký tự")
    .max(100, "Họ và tên tối đa 100 ký tự"),
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Định dạng email không hợp lệ"),
  staffRole: z.enum(["ADMIN", "SUPPORT", "ACCOUNTANT"], {
    message: "Vui lòng chọn vai trò hợp lệ",
  }),
});

export type CreateStaffFormValues = z.infer<typeof createStaffSchema>;

export const updateStaffRoleSchema = z.object({
  staffRole: z.enum(["ADMIN", "SUPPORT", "ACCOUNTANT"], {
    message: "Vui lòng chọn vai trò hợp lệ",
  }),
  reason: z
    .string()
    .min(10, "Lý do thay đổi vai trò phải có ít nhất 10 ký tự"),
});

export type UpdateStaffRoleFormValues = z.infer<typeof updateStaffRoleSchema>;

export const lockStaffSchema = z.object({
  reason: z
    .string()
    .min(10, "Lý do khoá tài khoản phải có ít nhất 10 ký tự"),
});

export type LockStaffFormValues = z.infer<typeof lockStaffSchema>;
