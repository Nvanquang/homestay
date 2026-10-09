import { z } from "zod";

export const basicInfoSchema = z.object({
  propertyType: z.enum(["ENTIRE_PLACE", "PRIVATE_ROOM"], {
    message: "Vui lòng chọn loại hình chỗ nghỉ",
  }),
  title: z
    .string()
    .min(10, "Tên chỗ nghỉ phải có ít nhất 10 ký tự")
    .max(80, "Tên chỗ nghỉ không được vượt quá 80 ký tự"),
  description: z
    .string()
    .min(50, "Mô tả chỗ nghỉ phải có ít nhất 50 ký tự")
    .max(2000, "Mô tả không được vượt quá 2000 ký tự"),
  maxGuests: z
    .number()
    .int()
    .min(1, "Số khách tối thiểu là 1")
    .max(30, "Số khách tối đa là 30"),
  bedrooms: z
    .number()
    .int()
    .min(0, "Số phòng ngủ không thể âm (0 là căn hộ Studio)")
    .max(20, "Số phòng ngủ tối đa là 20"),
  beds: z
    .number()
    .int()
    .min(1, "Số giường tối thiểu là 1"),
  bathrooms: z
    .number()
    .min(0.5, "Số phòng tắm tối thiểu là 0.5")
    .max(20, "Số phòng tắm tối đa là 20"),
  checkInTime: z.string().min(1, "Vui lòng chọn giờ nhận phòng"),
  checkOutTime: z.string().min(1, "Vui lòng chọn giờ trả phòng"),
  currency: z.string().default("VND"),
});

export type BasicInfoFormValues = z.infer<typeof basicInfoSchema>;

export const locationSchema = z.object({
  province: z.string().min(1, "Vui lòng chọn Tỉnh / Thành phố"),
  district: z.string().min(1, "Vui lòng chọn Quận / Huyện / Khu vực"),
  exactAddress: z
    .string()
    .min(5, "Địa chỉ chính xác phải có ít nhất 5 ký tự")
    .max(200, "Địa chỉ chính xác không được vượt quá 200 ký tự"),
  exactLat: z
    .number()
    .min(-90, "Vĩ độ không hợp lệ (-90 đến 90)")
    .max(90, "Vĩ độ không hợp lệ (-90 đến 90)"),
  exactLng: z
    .number()
    .min(-180, "Kinh độ không hợp lệ (-180 đến 180)")
    .max(180, "Kinh độ không hợp lệ (-180 đến 180)"),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

export const photoItemSchema = z.object({
  id: z.string(),
  url: z.string().min(1),
  order: z.number().int().min(0),
  caption: z.string().max(120).optional(),
  status: z.enum(["READY", "UPLOADING", "ERROR"]),
});

export const photosStepSchema = z.object({
  photos: z
    .array(photoItemSchema)
    .min(1, "Vui lòng tải lên ít nhất 1 ảnh để tiếp tục lưu nháp")
    .max(30, "Chỗ nghỉ tối đa được tải 30 ảnh"),
});

export type PhotosStepFormValues = z.infer<typeof photosStepSchema>;

export const amenitiesStepSchema = z.object({
  amenityIds: z.array(z.string()).default([]),
});

export type AmenitiesStepFormValues = z.infer<typeof amenitiesStepSchema>;

// S06 Booking Rules Schema
export function getBookingRulesSchema(locale: string = "vi") {
  const isEn = locale === "en";

  return z
    .object({
      minNights: z
        .number()
        .int()
        .min(1, isEn ? "Minimum nights must be at least 1" : "Đêm tối thiểu phải từ 1 đêm trở lên")
        .max(365, isEn ? "Minimum nights cannot exceed 365" : "Đêm tối thiểu không quá 365 đêm"),
      maxNights: z
        .number()
        .int()
        .min(1, isEn ? "Maximum nights must be at least 1" : "Đêm tối đa phải từ 1 đêm trở lên")
        .max(365, isEn ? "Maximum nights cannot exceed 365" : "Đêm tối đa không quá 365 đêm"),
      prepNights: z.number().int().min(0).max(3).default(0),
      minNoticeHours: z.number().int().min(0).max(720).default(0),
      maxAdvanceMonths: z.number().int().min(1).max(24).default(12),
      houseRules: z.object({
        smoking: z.boolean().default(false),
        pets: z.boolean().default(false),
        parties: z.boolean().default(false),
        quietHoursEnabled: z.boolean().default(true),
        quietHoursFrom: z.string().default("22:00"),
        quietHoursTo: z.string().default("07:00"),
        notes: z.string().max(1000).optional(),
      }),
    })
    .superRefine((data, ctx) => {
      // Cross-field validation: S06 AC "Đêm tối thiểu không được lớn hơn đêm tối đa"
      if (data.minNights > data.maxNights) {
        const msg = isEn
          ? "Minimum nights cannot be greater than maximum nights"
          : "Đêm tối thiểu không được lớn hơn đêm tối đa";
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["minNights"],
          message: msg,
        });
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["maxNights"],
          message: msg,
        });
      }
    });
}

export const bookingRulesSchema = getBookingRulesSchema("vi");
export type BookingRulesFormValues = z.infer<typeof bookingRulesSchema>;

// S06 Pricing Schema
export function getPricingSchema(locale: string = "vi") {
  const isEn = locale === "en";

  return z.object({
    baseNightlyPrice: z
      .number()
      .min(10000, isEn ? "Base price per night must be at least 10,000 VND" : "Giá cơ bản mỗi đêm phải từ 10.000₫ trở lên"),
    weekendNightlyPrice: z.number().min(0).optional(),
    cleaningFee: z
      .number()
      .min(0, isEn ? "Cleaning fee cannot be negative" : "Phí vệ sinh không được âm")
      .default(0),
    baseGuests: z
      .number()
      .int()
      .min(1, isEn ? "Base guests must be at least 1" : "Số khách tính giá cơ bản tối thiểu là 1")
      .default(2),
    extraGuestFee: z
      .number()
      .min(0, isEn ? "Extra guest fee cannot be negative" : "Phí khách thêm không được âm")
      .default(0),
    weeklyDiscountPct: z
      .number()
      .min(0, isEn ? "Discount must be between 0 and 100%" : "Mức giảm phải từ 0% đến 100%")
      .max(100, isEn ? "Discount cannot exceed 100%" : "Mức giảm không thể vượt quá 100%")
      .default(0),
    monthlyDiscountPct: z
      .number()
      .min(0, isEn ? "Discount must be between 0 and 100%" : "Mức giảm phải từ 0% đến 100%")
      .max(100, isEn ? "Discount cannot exceed 100%" : "Mức giảm không thể vượt quá 100%")
      .default(0),
    currency: z.string().default("VND"),
  });
}

export const pricingSchema = getPricingSchema("vi");
export type PricingFormValues = z.infer<typeof pricingSchema>;
