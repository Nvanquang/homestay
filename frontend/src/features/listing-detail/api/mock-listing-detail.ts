import {
  ListingDetailDTO,
  HostPublicProfile,
  CancellationPolicyDetail,
  BookingQuoteResult,
  QuoteLineItem,
} from "../types";
import { QuoteRequestSchemaType } from "../schemas";

export const MOCK_POLICIES_VI: Record<string, CancellationPolicyDetail> = {
  FLEXIBLE: {
    id: "pol-flex",
    key: "FLEXIBLE",
    name: "Linh hoạt (Flexible)",
    summary: "Hủy trước 24 giờ so với giờ nhận phòng để được hoàn lại 100% tiền phòng & các khoản phí.",
    milestones: [
      {
        label: "Trước khi check-in ≥ 24 giờ",
        windowHours: 24,
        roomRefundPercent: 100,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 100,
      },
      {
        label: "Trước khi check-in < 24 giờ",
        windowHours: 0,
        roomRefundPercent: 0, // Mất đêm đầu, hoàn các đêm sau nếu có
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
      {
        label: "Sau khi đã check-in",
        windowHours: -1,
        roomRefundPercent: 80, // Hoàn 80% các đêm chưa ở
        cleaningRefundPercent: 0,
        serviceFeeRefundPercent: 0,
      },
    ],
    specialCases: {
      hostCancel: "Nếu Host hủy đặt phòng, khách được hoàn lại 100% và nhận coupon đền bù 20% giá trị.",
      forceMajeure: "Trường hợp thiên tai, dịch bệnh hoặc lệnh khẩn cấp, hoàn 100% theo chính sách bất khả kháng.",
    },
  },
  MODERATE: {
    id: "pol-mod",
    key: "MODERATE",
    name: "Tiêu chuẩn (Moderate)",
    summary: "Hủy trước 5 ngày so với giờ nhận phòng để được hoàn lại 100%. Hủy sau đó mất phí đêm đầu + 50% tiền phòng còn lại.",
    milestones: [
      {
        label: "Trước khi check-in ≥ 5 ngày (120 giờ)",
        windowHours: 120,
        roomRefundPercent: 100,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 100,
      },
      {
        label: "Trong vòng 5 ngày trước check-in",
        windowHours: 0,
        roomRefundPercent: 50,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
      {
        label: "Sau khi đã check-in",
        windowHours: -1,
        roomRefundPercent: 50,
        cleaningRefundPercent: 0,
        serviceFeeRefundPercent: 0,
      },
    ],
    specialCases: {
      hostCancel: "Nếu Host hủy đặt phòng, khách được hoàn lại 100% và nhận coupon đền bù 20% giá trị.",
      forceMajeure: "Áp dụng chính sách hoàn trả linh hoạt khi có sự kiện bất khả kháng được xác minh.",
    },
  },
  STRICT: {
    id: "pol-strict",
    key: "STRICT",
    name: "Nghiêm ngặt (Strict)",
    summary: "Hủy trong vòng 48 giờ sau khi đặt phòng và cách ngày check-in ít nhất 14 ngày để được hoàn 100%. Sau đó hoàn 50% trước 7 ngày.",
    milestones: [
      {
        label: "Trong vòng 48h đặt phòng & ≥ 14 ngày trước check-in",
        windowHours: 336,
        roomRefundPercent: 100,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 100,
      },
      {
        label: "Trước khi check-in ≥ 7 ngày",
        windowHours: 168,
        roomRefundPercent: 50,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
      {
        label: "Trong vòng 7 ngày trước check-in",
        windowHours: 0,
        roomRefundPercent: 0,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
    ],
    specialCases: {
      hostCancel: "Nếu Host hủy đặt phòng, khách được hoàn lại 100% và nhận coupon đền bù 20% giá trị.",
      forceMajeure: "Áp dụng hoàn 100% khi có xác nhận thiên tai hoặc lệnh hạn chế từ cơ quan nhà nước.",
    },
  },
};

export const MOCK_POLICIES_EN: Record<string, CancellationPolicyDetail> = {
  FLEXIBLE: {
    id: "pol-flex",
    key: "FLEXIBLE",
    name: "Flexible",
    summary: "Full refund 1 day prior to arrival. 100% refund of room rate and all fees if cancelled at least 24 hours before check-in.",
    milestones: [
      {
        label: "≥ 24 hours before check-in",
        windowHours: 24,
        roomRefundPercent: 100,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 100,
      },
      {
        label: "< 24 hours before check-in",
        windowHours: 0,
        roomRefundPercent: 0,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
      {
        label: "After check-in",
        windowHours: -1,
        roomRefundPercent: 80,
        cleaningRefundPercent: 0,
        serviceFeeRefundPercent: 0,
      },
    ],
    specialCases: {
      hostCancel: "If the host cancels the booking, guests receive a 100% refund plus a 20% compensation voucher.",
      forceMajeure: "100% refund applies in cases of verified natural disasters, epidemics, or government emergency orders.",
    },
  },
  MODERATE: {
    id: "pol-mod",
    key: "MODERATE",
    name: "Moderate",
    summary: "Full refund 5 days prior to arrival. Cancellations made less than 5 days before check-in forfeit the first night plus 50% of remaining room rate.",
    milestones: [
      {
        label: "≥ 5 days (120 hours) before check-in",
        windowHours: 120,
        roomRefundPercent: 100,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 100,
      },
      {
        label: "Within 5 days before check-in",
        windowHours: 0,
        roomRefundPercent: 50,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
      {
        label: "After check-in",
        windowHours: -1,
        roomRefundPercent: 50,
        cleaningRefundPercent: 0,
        serviceFeeRefundPercent: 0,
      },
    ],
    specialCases: {
      hostCancel: "If the host cancels the booking, guests receive a 100% refund plus a 20% compensation voucher.",
      forceMajeure: "Flexible refund applies with verified extenuating circumstances.",
    },
  },
  STRICT: {
    id: "pol-strict",
    key: "STRICT",
    name: "Strict",
    summary: "Full refund if cancelled within 48 hours of booking and at least 14 days before check-in. 50% refund up to 7 days before check-in.",
    milestones: [
      {
        label: "Within 48h of booking & ≥ 14 days before check-in",
        windowHours: 336,
        roomRefundPercent: 100,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 100,
      },
      {
        label: "≥ 7 days before check-in",
        windowHours: 168,
        roomRefundPercent: 50,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
      {
        label: "Within 7 days before check-in",
        windowHours: 0,
        roomRefundPercent: 0,
        cleaningRefundPercent: 100,
        serviceFeeRefundPercent: 0,
      },
    ],
    specialCases: {
      hostCancel: "If the host cancels the booking, guests receive a 100% refund plus a 20% compensation voucher.",
      forceMajeure: "Full refund applies when official disaster or government restriction documents are provided.",
    },
  },
};

export const MOCK_POLICIES = MOCK_POLICIES_VI;

export const MOCK_HOST_AN: HostPublicProfile = {
  id: "host-01",
  displayName: "Nguyễn Văn An",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  bio: "Xin chào! Tôi là An, một người yêu thiên nhiên và phong cảnh thơ mộng của Đà Lạt. Tôi đã gắn bó với vùng đất sương mù này hơn 8 năm và mong muốn mang đến cho bạn một không gian ấm cúng, đậm chất nghỉ dưỡng.",
  verified: true,
  joinedAt: "03/2026",
  activeListingCount: 3,
  responseRate: 99,
  responseTime: "trong vòng 1 giờ",
  ratingScore: 4.94,
  reviewCount: 148,
};

export const MOCK_LISTING_DETAIL_DL01: ListingDetailDTO = {
  id: "lst-dl-01",
  title: "Mây Lang Thang Homestay - View Đồi Thông Bạt Ngàn",
  propertyType: "ENTIRE_PLACE",
  areaLabel: "Phường 3, Đà Lạt, Lâm Đồng",
  description: `Tọa lạc trên sườn đồi thoai thoải hướng nhìn thẳng ra thung lũng thông xanh ngát, Mây Lang Thang Homestay mang đến cho bạn cảm giác hòa mình trọn vẹn vào thiên nhiên nguyên sơ của Đà Lạt.\n\nCăn nhà gỗ ấm áp được bài trí theo phong cách mộc mạc Bắc Âu kết hợp bản địa, ngập tràn ánh nắng ban mai và sương mù lãng đãng mỗi buổi chiều tà. Khoảng sân vườn rộng rãi thích hợp cho các buổi tiệc nướng BBQ ngoài trời hoặc thưởng trà bên bếp lửa hồng.\n\nChỉ cách trung tâm thành phố 10 phút lái xe, nơi đây vừa đủ tách biệt để tận hưởng sự yên bình, vừa thuận tiện cho các chuyến tham quan cà phê ngắm cảnh và ẩm thực địa phương.`,
  photos: [
    {
      id: "p-01",
      url: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80",
      caption: "Toàn cảnh phòng khách đón nắng hướng ra đồi thông",
      order: 1,
    },
    {
      id: "p-02",
      url: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80",
      caption: "Phòng ngủ ấm cúng với cửa kính lớn nhìn xuống thung lũng",
      order: 2,
    },
    {
      id: "p-03",
      url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      caption: "Khu vực ban công thưởng trà buổi sáng",
      order: 3,
    },
    {
      id: "p-04",
      url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
      caption: "Phòng tắm hiện đại view đồi",
      order: 4,
    },
    {
      id: "p-05",
      url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      caption: "Căn bếp đầy đủ dụng cụ nấu nướng",
      order: 5,
    },
    {
      id: "p-06",
      url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
      caption: "Sân vườn BBQ tiệc tối",
      order: 6,
    },
    {
      id: "p-07",
      url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      caption: "Góc đọc sách thư giãn",
      order: 7,
    },
    {
      id: "p-08",
      url: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
      caption: "Phòng ngủ thứ hai ấm áp",
      order: 8,
    },
  ],
  maxGuests: 4,
  standardGuests: 2,
  extraGuestFee: 150000,
  bedrooms: 2,
  beds: 2,
  bathrooms: 2,
  bookingMode: "INSTANT",
  cancellationPolicy: MOCK_POLICIES.FLEXIBLE,
  amenities: [
    { id: "wifi", name: "Wifi tốc độ cao (150 Mbps)", category: "ESSENTIAL", iconName: "wifi" },
    { id: "kitchen", name: "Bếp nấu gia đình đầy đủ dụng cụ", category: "ESSENTIAL", iconName: "utensils" },
    { id: "mountain_view", name: "Tầm nhìn thung lũng & đồi thông", category: "LOCATION", iconName: "mountain" },
    { id: "bbq", name: "Bếp nướng than BBQ ngoài trời", category: "FEATURE", iconName: "flame" },
    { id: "parking", name: "Chỗ đỗ xe ô tô miễn phí tại chỗ", category: "ESSENTIAL", iconName: "car" },
    { id: "balcony", name: "Ban công riêng thoáng đãng", category: "FEATURE", iconName: "sun" },
    { id: "coffee", name: "Máy pha cà phê & trà thảo mộc", category: "FEATURE", iconName: "coffee" },
    { id: "workspace", name: "Bàn làm việc yên tĩnh nhìn ra vườn", category: "FEATURE", iconName: "laptop" },
    { id: "hot_water", name: "Bình nước nóng 24/7", category: "ESSENTIAL", iconName: "droplet" },
    { id: "fire_extinguisher", name: "Bình chữa cháy & Hộp sơ cứu", category: "SAFETY", iconName: "shield" },
  ],
  stayRules: {
    minNights: 2,
    maxNights: 30,
    minNoticeHours: 24,
    maxAdvanceMonths: 12,
  },
  checkInTime: "14:00",
  checkOutTime: "12:00",
  houseRules: [
    "Không hút thuốc bên trong phòng ngủ (có khu vực hút thuốc riêng ngoài sân)",
    "Giữ yên tĩnh sau 22:00 để bảo đảm không gian thanh bình",
    "Không tổ chức tiệc tùng quá ồn ào hoặc sử dụng loa kéo công suất lớn",
    "Thú cưng được chào đón nếu báo trước với Host",
  ],
  publicArea: {
    centerLat: 11.9365,
    centerLng: 108.4412,
    radiusMeters: 500,
    label: "Phường 3, Đà Lạt (Vùng bảo vệ riêng tư)",
  },
  baseNightlyPrice: 1250000,
  weekendNightlyPrice: 1550000,
  cleaningFee: 200000,
  weeklyDiscountPercent: 10,
  monthlyDiscountPercent: 25,
  ratingScore: 4.92,
  reviewCount: 84,
  host: MOCK_HOST_AN,
  blockedDates: ["2026-10-15", "2026-10-16", "2026-10-17"],
};

export async function getListingDetail(id: string, locale: string = "vi"): Promise<ListingDetailDTO | null> {
  const policy = (locale === "en" ? MOCK_POLICIES_EN : MOCK_POLICIES_VI).FLEXIBLE;
  if (id === "lst-dl-01" || id === "lst-needs-changes-demo" || id === "lst-101") {
    return {
      ...MOCK_LISTING_DETAIL_DL01,
      id,
      cancellationPolicy: policy,
      title: locale === "en" ? "May Lang Thang Homestay - Pine Valley View" : MOCK_LISTING_DETAIL_DL01.title,
    };
  }
  return {
    ...MOCK_LISTING_DETAIL_DL01,
    id,
    cancellationPolicy: policy,
    title: locale === "en" ? `Premium Homestay Stay (${id})` : `Chỗ ở Homestay cao cấp (${id})`,
  };
}

export async function getHostPublicProfile(id: string): Promise<HostPublicProfile | null> {
  return MOCK_HOST_AN;
}

export async function getCancellationPolicies(locale: string = "vi"): Promise<CancellationPolicyDetail[]> {
  return locale === "en" ? Object.values(MOCK_POLICIES_EN) : Object.values(MOCK_POLICIES_VI);
}

/**
 * Pricing Engine Mock (Quy tắc bất biến: Frontend không bao giờ tự cộng dồn)
 */
export async function calculateBookingQuote(params: QuoteRequestSchemaType): Promise<BookingQuoteResult> {
  const listing = await getListingDetail(params.listingId);
  const basePrice = listing?.baseNightlyPrice || 1250000;
  const weekendPrice = listing?.weekendNightlyPrice || 1550000;
  const cleaningFee = listing?.cleaningFee || 200000;

  const d1 = new Date(params.checkin);
  const d2 = new Date(params.checkout);
  const diffDays = Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  const nights = diffDays > 0 ? diffDays : 0;
  const totalGuests = params.adults + params.children;

  // Validation
  const violations: Array<{ code: "UNAVAILABLE" | "MIN_NIGHTS" | "MAX_NIGHTS" | "NOTICE" | "CAPACITY"; message: string }> = [];

  if (listing && totalGuests > listing.maxGuests) {
    violations.push({
      code: "CAPACITY",
      message: `Chỗ ở này chỉ tiếp đón tối đa ${listing.maxGuests} khách.`,
    });
  }

  if (listing && nights < listing.stayRules.minNights) {
    violations.push({
      code: "MIN_NIGHTS",
      message: `Chỗ ở này yêu cầu đặt tối thiểu ${listing.stayRules.minNights} đêm.`,
    });
  }

  // Calculate day-by-day prices
  const nightlyBreakdown = [];
  let roomSubtotal = 0;

  for (let i = 0; i < nights; i++) {
    const cur = new Date(d1);
    cur.setDate(cur.getDate() + i);
    const dayOfWeek = cur.getDay(); // 0 is Sun, 5 is Fri, 6 is Sat
    const dateStr = cur.toISOString().split("T")[0];

    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const price = isWeekend ? weekendPrice : basePrice;
    const source: "BASE" | "WEEKEND" = isWeekend ? "WEEKEND" : "BASE";

    nightlyBreakdown.push({
      date: dateStr,
      price,
      source,
    });
    roomSubtotal += price;
  }

  // Extra guest fee
  let extraGuestAmount = 0;
  if (listing && totalGuests > listing.standardGuests) {
    const extraCount = totalGuests - listing.standardGuests;
    extraGuestAmount = extraCount * listing.extraGuestFee * nights;
  }

  // Discount (weekly >= 7 nights)
  let discountAmount = 0;
  if (nights >= 28 && listing && listing.monthlyDiscountPercent > 0) {
    discountAmount = Math.round((roomSubtotal * listing.monthlyDiscountPercent) / 100);
  } else if (nights >= 7 && listing && listing.weeklyDiscountPercent > 0) {
    discountAmount = Math.round((roomSubtotal * listing.weeklyDiscountPercent) / 100);
  }

  // Service fee (10% on room + extra guest - discount)
  const taxableRoomTotal = roomSubtotal + extraGuestAmount - discountAmount;
  const serviceFee = Math.round(taxableRoomTotal * 0.1);

  // Tax VAT (8%)
  const taxAmount = Math.round((taxableRoomTotal + cleaningFee + serviceFee) * 0.08);

  const finalTotal = taxableRoomTotal + cleaningFee + serviceFee + taxAmount;

  const lines: QuoteLineItem[] = [
    {
      key: "ROOM",
      label: `${nights} đêm × ${basePrice.toLocaleString("vi-VN")} ₫`,
      amount: roomSubtotal,
    },
  ];

  if (extraGuestAmount > 0) {
    lines.push({
      key: "EXTRA_GUEST" as const,
      label: `Phụ thu khách thêm (${totalGuests - (listing?.standardGuests || 2)} khách × ${nights} đêm)`,
      amount: extraGuestAmount,
    });
  }

  lines.push({
    key: "CLEANING" as const,
    label: "Phí vệ sinh",
    amount: cleaningFee,
  });

  if (discountAmount > 0) {
    lines.push({
      key: "DISCOUNT" as const,
      label: `Giảm giá thời gian lưu trú (${nights >= 28 ? "Theo tháng" : "Theo tuần"})`,
      amount: -discountAmount,
    });
  }

  lines.push({
    key: "SERVICE_FEE" as const,
    label: "Phí dịch vụ Homestay (10%)",
    amount: serviceFee,
  });

  lines.push({
    key: "TAX" as const,
    label: "Thuế & phí theo quy định (VAT 8%)",
    amount: taxAmount,
  });

  return {
    nights,
    guests: totalGuests,
    basePricePerNight: basePrice,
    lines,
    nightlyBreakdown,
    total: finalTotal,
    includesFeesAndTaxes: true,
    violations: violations.length > 0 ? violations : undefined,
  };
}
