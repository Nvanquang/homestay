import { z } from "zod";

export const identityVerificationSchema = z
  .object({
    legalName: z
      .string()
      .min(2, "Họ và tên theo giấy tờ tối thiểu 2 ký tự")
      .max(100, "Họ và tên tối đa 100 ký tự"),
    dateOfBirth: z
      .string()
      .min(1, "Vui lòng chọn ngày sinh")
      .refine((val) => {
        const birthDate = new Date(val);
        if (isNaN(birthDate.getTime())) return false;
        const now = new Date();
        const age =
          now.getFullYear() -
          birthDate.getFullYear() -
          (now < new Date(now.getFullYear(), birthDate.getMonth(), birthDate.getDate())
            ? 1
            : 0);
        return age >= 18;
      }, "Bạn phải đủ 18 tuổi trở lên để trở thành Host"),
    phone: z
      .string()
      .min(1, "Vui lòng nhập số điện thoại")
      .regex(
        /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
        "Số điện thoại không hợp lệ (định dạng 10 số, ví dụ 0912345678)"
      ),
    idType: z.enum(["CCCD", "PASSPORT"], {
      message: "Vui lòng chọn loại giấy tờ tùy thân",
    }),
    idNumber: z.string().min(1, "Vui lòng nhập số giấy tờ"),
  })
  .superRefine((data, ctx) => {
    if (data.idType === "CCCD") {
      if (!/^[0-9]{12}$/.test(data.idNumber.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idNumber"],
          message: "Số CCCD phải gồm đúng 12 chữ số",
        });
      }
    } else if (data.idType === "PASSPORT") {
      if (!/^[A-Z][0-9]{7,8}$/i.test(data.idNumber.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["idNumber"],
          message: "Số Hộ chiếu không hợp lệ (Ví dụ: B1234567)",
        });
      }
    }
  });

export type IdentityVerificationFormValues = z.infer<
  typeof identityVerificationSchema
>;

export const adminRejectReasonSchema = z.object({
  reasonCategory: z.enum(
    ["BLURRY", "EXPIRED_DOC", "MISMATCH", "INVALID_DOC", "OTHER"],
    { message: "Vui lòng chọn danh mục lý do từ chối" }
  ),
  note: z
    .string()
    .min(10, "Ghi chú gửi người dùng phải có ít nhất 10 ký tự"),
});

export type AdminRejectReasonFormValues = z.infer<
  typeof adminRejectReasonSchema
>;
