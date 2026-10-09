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

// ==========================================
// S08: LISTING REVIEW SCHEMAS (A04)
// ==========================================

export const reviewReasonItemSchema = z.object({
  section: z.enum([
    "PHOTOS",
    "DESCRIPTION",
    "LEGAL_DOCS",
    "PRICING",
    "LOCATION",
    "AMENITIES",
    "HOUSE_RULES",
    "OTHER",
  ]),
  stepNumber: z.number().int().min(1).max(8),
  note: z
    .string()
    .min(10, "Ghi chú hướng dẫn cho Host phải có ít nhất 10 ký tự"),
});

export const needsChangesDecisionSchema = z.object({
  reasons: z
    .array(reviewReasonItemSchema)
    .min(1, "Vui lòng chọn ít nhất 1 phần cần yêu cầu chỉnh sửa"),
  generalNote: z.string().optional(),
});

export type NeedsChangesFormValues = z.infer<typeof needsChangesDecisionSchema>;

export const rejectDecisionSchema = z.object({
  reason: z
    .string()
    .min(10, "Lý do từ chối bắt buộc có ít nhất 10 ký tự"),
  notes: z.string().optional(),
});

export type RejectFormValues = z.infer<typeof rejectDecisionSchema>;

export const approveDecisionSchema = z.object({
  acknowledgedDuplicateAddress: z.boolean().optional(),
  note: z.string().optional(),
});

export type ApproveFormValues = z.infer<typeof approveDecisionSchema>;

