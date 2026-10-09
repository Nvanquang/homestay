import { z } from "zod";

export const priceRuleSchema = z
  .object({
    id: z.string().optional(),
    listingId: z.string().min(1, "Listing ID is required"),
    type: z.enum(["SEASON", "HOLIDAY", "SPECIAL"], {
      error: "Loại quy tắc không hợp lệ",
    }),
    name: z
      .string()
      .min(2, "Tên quy tắc phải có ít nhất 2 ký tự")
      .max(60, "Tên quy tắc tối đa 60 ký tự"),
    dateFrom: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày bắt đầu không hợp lệ (YYYY-MM-DD)"),
    dateTo: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày kết thúc không hợp lệ (YYYY-MM-DD)"),
    nightlyPrice: z
      .number()
      .min(10000, "Giá tối thiểu 10.000 ₫")
      .max(100000000, "Giá tối đa 100.000.000 ₫"),
  })
  .refine((data) => data.dateTo >= data.dateFrom, {
    message: "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
    path: ["dateTo"],
  });

export const weekendPriceSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  nightlyPrice: z
    .number()
    .min(10000, "Giá tối thiểu 10.000 ₫")
    .max(100000000, "Giá tối đa 100.000.000 ₫"),
});

export type PriceRuleFormValues = z.infer<typeof priceRuleSchema>;
export type WeekendPriceFormValues = z.infer<typeof weekendPriceSchema>;
