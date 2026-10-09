import { z } from "zod";

export function getIdentityVerificationSchema(locale: string = "vi") {
  const isEn = locale === "en";

  return z
    .object({
      legalName: z
        .string()
        .min(2, isEn ? "Full legal name must be at least 2 characters" : "Họ và tên theo giấy tờ tối thiểu 2 ký tự")
        .max(100, isEn ? "Full legal name cannot exceed 100 characters" : "Họ và tên tối đa 100 ký tự"),
      dateOfBirth: z
        .string()
        .min(1, isEn ? "Please select your date of birth" : "Vui lòng chọn ngày sinh")
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
        }, isEn ? "You must be at least 18 years old to become a Host" : "Bạn phải đủ 18 tuổi trở lên để trở thành Host"),
      phone: z
        .string()
        .min(1, isEn ? "Please enter your phone number" : "Vui lòng nhập số điện thoại")
        .regex(
          /^(0|\+84)[3|5|7|8|9][0-9]{8}$/,
          isEn ? "Invalid phone number (10 digits format, e.g. 0912345678)" : "Số điện thoại không hợp lệ (định dạng 10 số, ví dụ 0912345678)"
        ),
      idType: z.enum(["CCCD", "PASSPORT"], {
        message: isEn ? "Please select your identity document type" : "Vui lòng chọn loại giấy tờ tùy thân",
      }),
      idNumber: z.string().min(1, isEn ? "Please enter your document number" : "Vui lòng nhập số giấy tờ"),
    })
    .superRefine((data, ctx) => {
      if (data.idType === "CCCD") {
        if (!/^[0-9]{12}$/.test(data.idNumber.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["idNumber"],
            message: isEn ? "CCCD number must be exactly 12 numerical digits" : "Số CCCD phải gồm đúng 12 chữ số",
          });
        }
      } else if (data.idType === "PASSPORT") {
        if (!/^[A-Z][0-9]{7,8}$/i.test(data.idNumber.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["idNumber"],
            message: isEn ? "Invalid Passport number (e.g. B1234567)" : "Số Hộ chiếu không hợp lệ (Ví dụ: B1234567)",
          });
        }
      }
    });
}

export const identityVerificationSchema = getIdentityVerificationSchema("vi");

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
