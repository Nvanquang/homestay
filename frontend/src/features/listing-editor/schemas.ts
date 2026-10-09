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
