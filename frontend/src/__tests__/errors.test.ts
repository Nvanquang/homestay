import { describe, it, expect } from "vitest";
import {
  normalizeProblemDetails,
  getErrorMessageByCode,
  AppApiError,
} from "@/lib/errors";

describe("Problem Details Error Normalizer (src/lib/errors.ts)", () => {
  it("translates error codes to Vietnamese and English messages", () => {
    const msgVi = getErrorMessageByCode("calendar.unavailable", "vi");
    expect(msgVi).toContain("Phòng đã có khách đặt");

    const msgEn = getErrorMessageByCode("calendar.unavailable", "en");
    expect(msgEn).toContain("already booked or blocked");

    const fallbackVi = getErrorMessageByCode("unknown_code", "vi");
    expect(fallbackVi).toContain("Đã có lỗi xảy ra");
  });

  it("normalizes RFC 7807 Problem Details object with field errors", () => {
    const rawProblem = {
      status: 400,
      code: "VALIDATION",
      title: "Validation Error",
      traceId: "trace-abc-123",
      fieldErrors: [
        { field: "email", code: "validation", message: "Email không hợp lệ" },
        { field: "password", code: "validation" },
      ],
    };

    const normalized = normalizeProblemDetails(rawProblem, "vi");
    expect(normalized.status).toBe(400);
    expect(normalized.code).toBe("VALIDATION");
    expect(normalized.traceId).toBe("trace-abc-123");
    expect(normalized.fieldErrors.email).toBe("Email không hợp lệ");
    expect(normalized.fieldErrors.password).toContain("Dữ liệu nhập vào chưa hợp lệ");
  });

  it("creates AppApiError with proper properties", () => {
    const error = new AppApiError(
      {
        status: 403,
        code: "auth.forbidden",
        traceId: "trace-403",
      },
      "en"
    );

    expect(error.name).toBe("AppApiError");
    expect(error.status).toBe(403);
    expect(error.code).toBe("auth.forbidden");
    expect(error.message).toContain("permission");
    expect(error.traceId).toBe("trace-403");
  });
});
