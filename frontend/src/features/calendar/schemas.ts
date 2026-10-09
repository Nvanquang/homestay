import { z } from "zod";

export const blockDatesSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  nights: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1, "Phải chọn ít nhất 1 đêm"),
  reason: z.string().max(200, "Lý do tối đa 200 ký tự").optional(),
});

export const unblockDatesSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  nights: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1, "Phải chọn ít nhất 1 đêm"),
});

export const stayRulesSchema = z
  .object({
    minNights: z.number().int().min(1, "Tối thiểu 1 đêm").max(365, "Tối đa 365 đêm"),
    maxNights: z.number().int().min(1, "Tối thiểu 1 đêm").max(365, "Tối đa 365 đêm"),
    prepNights: z.number().int().min(0, "Tối thiểu 0 ngày").max(7, "Tối đa 7 ngày chuẩn bị"),
    minNoticeHours: z.number().int().min(0, "Tối thiểu 0 giờ").max(168, "Tối đa 168 giờ (7 ngày)"),
    maxAdvanceMonths: z.number().int().min(1, "Tối thiểu 1 tháng").max(24, "Tối đa 24 tháng"),
  })
  .refine((data) => data.maxNights >= data.minNights, {
    message: "Số đêm tối đa phải lớn hơn hoặc bằng số đêm tối thiểu",
    path: ["maxNights"],
  });

export type BlockDatesFormValues = z.infer<typeof blockDatesSchema>;
export type UnblockDatesFormValues = z.infer<typeof unblockDatesSchema>;
export type StayRulesFormValues = z.infer<typeof stayRulesSchema>;
