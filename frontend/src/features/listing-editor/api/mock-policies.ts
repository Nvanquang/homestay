import { CancellationPolicyDetail, CancellationPolicyType } from "../types";

export const MOCK_CANCELLATION_POLICIES: Record<
  CancellationPolicyType,
  CancellationPolicyDetail
> = {
  FLEXIBLE: {
    id: "FLEXIBLE",
    nameVi: "Linh hoạt (Flexible)",
    nameEn: "Flexible",
    summaryVi: "Hoàn tiền 100% nếu huỷ trước 24 giờ so với thời điểm nhận phòng.",
    summaryEn: "100% refund up to 24 hours before standard check-in time.",
    badgeVi: "Được khách ưa chuộng nhất",
    badgeEn: "Most popular among guests",
    tiers: [
      {
        hoursBefore: 24,
        refundPercent: 100,
        noteVi: "Huỷ trước 24 giờ trước nhận phòng: Hoàn 100% toàn bộ tiền phòng và phí vệ sinh.",
        noteEn: "Cancel at least 24 hours before check-in: 100% refund of all room rates and cleaning fee.",
      },
      {
        hoursBefore: 0,
        refundPercent: 50,
        noteVi: "Huỷ trong vòng 24 giờ trước nhận phòng: Thu 100% đêm đầu tiên, hoàn 50% các đêm còn lại.",
        noteEn: "Cancel within 24 hours of check-in: First night non-refundable, 50% refund for remaining nights.",
      },
    ],
  },
  MODERATE: {
    id: "MODERATE",
    nameVi: "Trung bình (Moderate)",
    nameEn: "Moderate",
    summaryVi: "Hoàn tiền 100% nếu huỷ trước 5 ngày so với thời điểm nhận phòng.",
    summaryEn: "100% refund up to 5 days before standard check-in time.",
    badgeVi: "Cân bằng lợi ích Host & Khách",
    badgeEn: "Balanced for Host & Guest",
    tiers: [
      {
        hoursBefore: 120, // 5 days
        refundPercent: 100,
        noteVi: "Huỷ trước 5 ngày trước nhận phòng: Hoàn 100% toàn bộ tiền phòng.",
        noteEn: "Cancel at least 5 days before check-in: 100% full refund.",
      },
      {
        hoursBefore: 24,
        refundPercent: 50,
        noteVi: "Huỷ từ 5 ngày đến 24 giờ trước nhận phòng: Hoàn 50% tiền phòng + 100% phí vệ sinh.",
        noteEn: "Cancel between 5 days and 24 hours before check-in: 50% refund + full cleaning fee.",
      },
      {
        hoursBefore: 0,
        refundPercent: 0,
        noteVi: "Huỷ trong vòng 24 giờ trước nhận phòng: Không hoàn tiền tiền phòng, hoàn 100% phí vệ sinh.",
        noteEn: "Cancel within 24 hours of check-in: Non-refundable for room charges, 100% cleaning fee refunded.",
      },
    ],
  },
  STRICT: {
    id: "STRICT",
    nameVi: "Nghiêm ngặt (Strict)",
    nameEn: "Strict",
    summaryVi: "Hoàn 50% nếu huỷ trước 7 ngày; không hoàn tiền sau mốc đó.",
    summaryEn: "50% refund up to 7 days before check-in; non-refundable afterwards.",
    badgeVi: "Bảo vệ tối đa thu nhập của Host",
    badgeEn: "Maximum host revenue protection",
    tiers: [
      {
        hoursBefore: 168, // 7 days
        refundPercent: 50,
        noteVi: "Huỷ trước 7 ngày trước nhận phòng: Hoàn 50% tiền phòng + 100% phí vệ sinh.",
        noteEn: "Cancel at least 7 days before check-in: 50% refund + full cleaning fee.",
      },
      {
        hoursBefore: 0,
        refundPercent: 0,
        noteVi: "Huỷ dưới 7 ngày trước nhận phòng: Không hoàn tiền phòng, chỉ hoàn phí vệ sinh nếu khách chưa check-in.",
        noteEn: "Cancel less than 7 days before check-in: Non-refundable, cleaning fee refunded only if no check-in.",
      },
    ],
  },
};

export function getCancellationPolicyDetails(
  id: CancellationPolicyType
): CancellationPolicyDetail {
  return MOCK_CANCELLATION_POLICIES[id] || MOCK_CANCELLATION_POLICIES.FLEXIBLE;
}
