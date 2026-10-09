import {
  PricingData,
  BookingRulesData,
  PricingPreviewParams,
  PricingPreviewResult,
  NightlyPriceBreakdown,
  PricingViolation,
} from "../types";

export function calculatePricingPreview(
  pricing: PricingData,
  rules: Partial<BookingRulesData> | undefined,
  params: PricingPreviewParams
): PricingPreviewResult {
  const { checkIn, checkOut, guests } = params;

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  const rawNights = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const nights = Math.max(1, isNaN(rawNights) ? 1 : rawNights);

  // Check violations
  const violations: PricingViolation[] = [];
  const minNights = rules?.minNights ?? 1;
  const maxNights = rules?.maxNights ?? 30;

  if (nights < minNights) {
    violations.push({
      code: "MIN_NIGHTS",
      message: `Khoảng ngày đã chọn (${nights} đêm) ít hơn số đêm tối thiểu của chỗ nghỉ (${minNights} đêm).`,
    });
  } else if (nights > maxNights) {
    violations.push({
      code: "MAX_NIGHTS",
      message: `Khoảng ngày đã chọn (${nights} đêm) vượt quá số đêm tối đa của chỗ nghỉ (${maxNights} đêm).`,
    });
  }

  // Nightly Breakdown
  const nightlyBreakdown: NightlyPriceBreakdown[] = [];
  const curr = new Date(start);

  for (let i = 0; i < nights; i++) {
    const dayOfWeek = curr.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const nightlyPrice =
      isWeekend && pricing.weekendNightlyPrice && pricing.weekendNightlyPrice > 0
        ? pricing.weekendNightlyPrice
        : pricing.baseNightlyPrice;

    nightlyBreakdown.push({
      date: curr.toISOString().split("T")[0],
      price: nightlyPrice,
      source: isWeekend && pricing.weekendNightlyPrice ? "WEEKEND" : "BASE",
    });

    curr.setDate(curr.getDate() + 1);
  }

  const roomSubtotal = nightlyBreakdown.reduce((sum, item) => sum + item.price, 0);

  // Extra guest calculation
  const baseGuests = pricing.baseGuests || 1;
  const extraGuestsCount = Math.max(0, guests - baseGuests);
  const extraGuestFee = pricing.extraGuestFee || 0;
  const extraGuestTotal = extraGuestsCount * extraGuestFee * nights;

  // Cleaning fee
  const cleaningFee = pricing.cleaningFee || 0;

  // Discount calculation (BR-PRC-02: nếu đủ điều kiện cả 2, áp dụng mức giảm tháng)
  let discountType: "WEEKLY" | "MONTHLY" | undefined = undefined;
  let discountPct = 0;
  let discountAmount = 0;

  if (nights >= 28 && (pricing.monthlyDiscountPct || 0) > 0) {
    discountType = "MONTHLY";
    discountPct = pricing.monthlyDiscountPct;
    discountAmount = Math.round((roomSubtotal * discountPct) / 100);
  } else if (nights >= 7 && (pricing.weeklyDiscountPct || 0) > 0) {
    discountType = "WEEKLY";
    discountPct = pricing.weeklyDiscountPct;
    discountAmount = Math.round((roomSubtotal * discountPct) / 100);
  }

  // Host total (Các khoản host quản lý)
  const hostTotal = Math.max(
    0,
    roomSubtotal + extraGuestTotal + cleaningFee - discountAmount
  );

  // Platform commission fee (3% host fee)
  const platformFeeAmount = Math.round(hostTotal * 0.03);

  return {
    nights,
    roomSubtotal,
    extraGuestsCount,
    extraGuestTotal,
    cleaningFee,
    discountType,
    discountPct,
    discountAmount,
    hostTotal,
    guestTotal: hostTotal,
    platformFeeAmount,
    nightlyBreakdown,
    currency: pricing.currency || "VND",
    violations,
  };
}

export async function fetchPricingPreviewMock(
  pricing: PricingData,
  rules: Partial<BookingRulesData> | undefined,
  params: PricingPreviewParams
): Promise<PricingPreviewResult> {
  // Simulate 120ms server delay
  await new Promise((r) => setTimeout(r, 120));
  return calculatePricingPreview(pricing, rules, params);
}
