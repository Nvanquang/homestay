import {
  ListingReviewQueueItem,
  ListingReviewQueueFilter,
  ListingReviewQueueResponse,
  ListingReviewDetail,
  ListingReviewDecisionPayload,
  ListingDocViewLogItem,
  DuplicateAddressAlert,
} from "../types";
import { AppApiError } from "@/lib/errors";

const CURRENT_ADMIN_DEFAULT = {
  id: "adm-001",
  name: "Nguyễn Văn Admin",
};

// Initial Mock Review Listings
let MOCK_LISTING_QUEUE: ListingReviewDetail[] = [
  {
    id: "lst-rev-01",
    title: "The Oasis Villa hồ Tuyền Lâm view rừng thông",
    description: "Biệt thự nghỉ dưỡng cao cấp ven hồ Tuyền Lâm với đầy đủ tiện nghi, sân vườn BBQ và không gian hoàn toàn riêng tư cho gia đình hoặc nhóm bạn bè.",
    propertyType: "ENTIRE_PLACE",
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 3,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    location: {
      province: "Lâm Đồng",
      district: "Thành phố Đà Lạt",
      exactAddress: "Khu du lịch Hồ Tuyền Lâm, Phường 4, TP. Đà Lạt",
      exactLat: 11.9023,
      exactLng: 108.4356,
      publicArea: {
        centerLat: 11.9023,
        centerLng: 108.4356,
        radiusM: 500,
      },
    },
    photos: [
      {
        id: "p-01",
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        caption: "Phòng khách sang trọng hướng hồ",
        order: 0,
      },
      {
        id: "p-02",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        caption: "Toàn cảnh biệt thự ban ngày",
        order: 1,
      },
      {
        id: "p-03",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        caption: "Phòng tắm master view rừng",
        order: 2,
      },
      {
        id: "p-04",
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
        caption: "Khu vực bếp và bàn ăn dài",
        order: 3,
      },
      {
        id: "p-05",
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
        caption: "Hiên ngắm hoàng hôn",
        order: 4,
      },
    ],
    amenityIds: ["amenity-wifi", "amenity-aircon", "amenity-tv", "amenity-kitchen", "amenity-parking"],
    houseRules: {
      smoking: false,
      pets: true,
      parties: false,
      quietHoursEnabled: true,
      quietHoursFrom: "22:00",
      quietHoursTo: "06:00",
      notes: "Vui lòng giữ gìn vệ sinh chung và không gây tiếng ồn lớn sau 22h.",
    },
    pricing: {
      baseNightlyPrice: 2800000,
      weekendNightlyPrice: 3200000,
      cleaningFee: 300000,
      extraGuestFee: 150000,
      baseGuests: 4,
      weeklyDiscountPct: 10,
      monthlyDiscountPct: 20,
      currency: "VND",
    },
    policy: {
      cancellationPolicy: "MODERATE",
      bookingMode: "INSTANT",
    },
    legal: {
      legalRegistrationNumber: "0109887766-001",
      legalDocs: [
        {
          id: "doc-01",
          docType: "OPERATING_LICENSE",
          fileName: "Giay_phep_kinh_doanh_Oasis.pdf",
          fileSize: 2450000,
          fileUrl: "/docs/sample-operating-license.pdf",
          uploadedAt: "2026-10-06T09:00:00Z",
        },
        {
          id: "doc-02",
          docType: "FIRE_SAFETY",
          fileName: "Chung_nhan_PCCC_2026.pdf",
          fileSize: 1850000,
          fileUrl: "/docs/sample-pccc.pdf",
          uploadedAt: "2026-10-06T09:15:00Z",
        },
      ],
    },
    host: {
      id: "hst-001",
      fullName: "Lê Hoàng Phúc",
      email: "hoangphuc.le@example.com",
      phone: "+84912345678",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      identityStatus: "VERIFIED",
      listingCount: 2,
      joinedAt: "2025-11-10T00:00:00Z",
    },
    revisionNo: 1,
    submittedAt: "2026-10-06T09:30:00Z",
    status: "PENDING_REVIEW",
    duplicates: [],
    lockedBy: null,
  },
  {
    id: "lst-rev-02",
    title: "Căn hộ Studio trung tâm Đà Nẵng sát biển Mỹ Khê",
    description: "Căn hộ studio tầng cao thoáng mát, cách bãi biển Mỹ Khê chỉ 200m đi bộ. Đầy đủ tiện ích hồ bơi, gym và quầy lễ tân 24/7.",
    propertyType: "PRIVATE_ROOM",
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    checkInTime: "14:00",
    checkOutTime: "11:00",
    location: {
      province: "Đà Nẵng",
      district: "Quận Ngũ Hành Sơn",
      exactAddress: "Số 88 đường Võ Nguyên Giáp, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng",
      exactLat: 16.0544,
      exactLng: 108.2435,
      publicArea: {
        centerLat: 16.0544,
        centerLng: 108.2435,
        radiusM: 500,
      },
    },
    photos: [
      {
        id: "p-11",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        caption: "Không gian studio ấm cúng",
        order: 0,
      },
      {
        id: "p-12",
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        caption: "Bàn làm việc và góc bếp nhỏ",
        order: 1,
      },
      {
        id: "p-13",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        caption: "Phòng tắm hiện đại",
        order: 2,
      },
      {
        id: "p-14",
        url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
        caption: "Giường ngủ êm ái",
        order: 3,
      },
      {
        id: "p-15",
        url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
        caption: "Ban công đón gió biển",
        order: 4,
      },
    ],
    amenityIds: ["amenity-wifi", "amenity-aircon", "amenity-tv", "amenity-pool"],
    houseRules: {
      smoking: false,
      pets: false,
      parties: false,
      quietHoursEnabled: true,
      quietHoursFrom: "22:00",
      quietHoursTo: "07:00",
    },
    pricing: {
      baseNightlyPrice: 850000,
      weekendNightlyPrice: 950000,
      cleaningFee: 150000,
      baseGuests: 2,
      currency: "VND",
    },
    policy: {
      cancellationPolicy: "FLEXIBLE",
      bookingMode: "INSTANT",
    },
    legal: {
      legalRegistrationNumber: "4801239999",
      legalDocs: [
        {
          id: "doc-11",
          docType: "OPERATING_LICENSE",
          fileName: "Giay_phep_kinh_doanh_Danang.pdf",
          fileSize: 1900000,
          fileUrl: "/docs/sample-danang-license.pdf",
          uploadedAt: "2026-10-07T10:00:00Z",
        },
      ],
    },
    host: {
      id: "hst-002",
      fullName: "Trần Minh Quang",
      email: "quang.tran@example.com",
      phone: "+84908889999",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      identityStatus: "VERIFIED",
      listingCount: 1,
      joinedAt: "2026-01-15T00:00:00Z",
    },
    revisionNo: 1,
    submittedAt: "2026-10-07T10:30:00Z",
    status: "PENDING_REVIEW",
    // CẢNH BÁO TRÙNG ĐỊA CHỈ (BR-LST-06)
    duplicates: [
      {
        duplicateListingId: "lst-207",
        duplicateListingTitle: "Căn hộ Condotel Biển Mỹ Khê tầng 12",
        duplicateHostId: "hst-999",
        duplicateHostName: "Công ty TNHH Nghỉ Dưỡng Biển Xanh",
        similarity: "SAME_ADDRESS",
        exactAddress: "Số 88 đường Võ Nguyên Giáp, Phường Mỹ An, Quận Ngũ Hành Sơn, Đà Nẵng",
      },
    ],
    lockedBy: null,
  },
  {
    id: "lst-rev-03",
    title: "Phòng riêng view phố cổ Hà Nội - Tạ Hiện",
    description: "Trải nghiệm không gian sống cổ kính ngay ngã tư quốc tế Tạ Hiện, xung quanh đầy đủ quán ăn đêm và phố đi bộ cuối tuần.",
    propertyType: "PRIVATE_ROOM",
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    location: {
      province: "Hà Nội",
      district: "Quận Hoàn Kiếm",
      exactAddress: "Số 15 phố Tạ Hiện, Phường Hàng Buồm, Quận Hoàn Kiếm, Hà Nội",
      exactLat: 21.0345,
      exactLng: 105.8521,
    },
    photos: [
      {
        id: "p-21",
        url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        order: 0,
      },
      {
        id: "p-22",
        url: "https://images.unsplash.com/photo-1502005229762-ee1b2b93e000?auto=format&fit=crop&w=800&q=80",
        order: 1,
      },
      {
        id: "p-23",
        url: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80",
        order: 2,
      },
      {
        id: "p-24",
        url: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef3?auto=format&fit=crop&w=800&q=80",
        order: 3,
      },
      {
        id: "p-25",
        url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        order: 4,
      },
    ],
    amenityIds: ["amenity-wifi", "amenity-aircon"],
    houseRules: {
      smoking: true,
      pets: false,
      parties: false,
      quietHoursEnabled: false,
    },
    pricing: {
      baseNightlyPrice: 650000,
      baseGuests: 2,
      currency: "VND",
    },
    policy: {
      cancellationPolicy: "STRICT",
      bookingMode: "REQUEST",
    },
    legal: {
      legalRegistrationNumber: "0100223344",
      legalDocs: [
        {
          id: "doc-21",
          docType: "OPERATING_LICENSE",
          fileName: "GiayPhepKinhDoanh_TaHien.jpg",
          fileSize: 1200000,
          fileUrl: "/docs/sample-tahien.jpg",
          uploadedAt: "2026-10-07T12:00:00Z",
        },
      ],
    },
    host: {
      id: "hst-003",
      fullName: "Đỗ Thu Hương",
      email: "thuhuong.do@example.com",
      identityStatus: "VERIFIED",
      listingCount: 3,
      joinedAt: "2024-05-20T00:00:00Z",
    },
    revisionNo: 2,
    submittedAt: "2026-10-07T14:00:00Z",
    status: "PENDING_REVIEW",
    duplicates: [],
    // ĐANG BỊ KHOÁ BỞI ADMIN KHÁC (CMP-31)
    lockedBy: {
      adminId: "adm-002",
      adminName: "Phạm CSKH Support",
      lockedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
  },
  {
    id: "lst-rev-04",
    title: "Nhà gỗ mộc mạc view thung lũng Sapa",
    description: "Homestay nhà gỗ nguyên căn ngắm trọn biển mây bản Tả Van.",
    propertyType: "ENTIRE_PLACE",
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    checkInTime: "14:00",
    checkOutTime: "12:00",
    location: {
      province: "Lào Cai",
      district: "Thị xã Sa Pa",
      exactAddress: "Bản Tả Van, Thị xã Sa Pa, Lào Cai",
      exactLat: 22.3021,
      exactLng: 103.8821,
    },
    photos: [
      {
        id: "p-31",
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        order: 0,
      },
      {
        id: "p-32",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        order: 1,
      },
      {
        id: "p-33",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        order: 2,
      },
      {
        id: "p-34",
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
        order: 3,
      },
      {
        id: "p-35",
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
        order: 4,
      },
    ],
    amenityIds: ["amenity-wifi", "amenity-parking"],
    houseRules: {
      smoking: false,
      pets: true,
      parties: false,
      quietHoursEnabled: true,
    },
    pricing: {
      baseNightlyPrice: 1500000,
      baseGuests: 2,
      currency: "VND",
    },
    policy: {
      cancellationPolicy: "MODERATE",
      bookingMode: "REQUEST",
    },
    legal: {
      legalRegistrationNumber: "",
      legalDocs: [],
    },
    host: {
      id: "hst-004",
      fullName: "Vàng A Tủa",
      email: "atua.sapa@example.com",
      identityStatus: "VERIFIED",
      listingCount: 1,
      joinedAt: "2026-03-01T00:00:00Z",
    },
    revisionNo: 1,
    submittedAt: "2026-10-08T08:00:00Z",
    status: "PENDING_REVIEW",
    duplicates: [],
    lockedBy: null,
  },
];

const EN_LISTING_OVERLAYS: Record<string, Partial<ListingReviewDetail>> = {
  "lst-rev-01": {
    title: "The Oasis Villa at Tuyen Lam Lake with Pine Forest View",
    description: "High-end luxury resort villa beside Tuyen Lam Lake featuring full modern amenities, outdoor BBQ yard, and tranquil privacy for family vacations or team gatherings.",
    location: {
      province: "Lam Dong",
      district: "Da Lat City",
      exactAddress: "Tuyen Lam Lake Ecotourism Area, Ward 4, Da Lat City, Lam Dong",
      exactLat: 11.9023,
      exactLng: 108.4356,
      publicArea: {
        centerLat: 11.9023,
        centerLng: 108.4356,
        radiusM: 500,
      },
    },
    houseRules: {
      smoking: false,
      pets: true,
      parties: false,
      quietHoursEnabled: true,
      quietHoursFrom: "22:00",
      quietHoursTo: "06:00",
      notes: "Please respect quiet hours after 22:00 and keep common areas clean.",
    },
    photos: [
      {
        id: "p-01",
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        caption: "Lake-view luxury living room",
        order: 0,
      },
      {
        id: "p-02",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        caption: "Daytime panoramic villa exterior",
        order: 1,
      },
      {
        id: "p-03",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        caption: "Master bathroom overlooking pine forest",
        order: 2,
      },
      {
        id: "p-04",
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
        caption: "Open kitchen and long dining table",
        order: 3,
      },
      {
        id: "p-05",
        url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
        caption: "Sunset viewing terrace veranda",
        order: 4,
      },
    ],
    legal: {
      legalRegistrationNumber: "0109887766-001",
      legalDocs: [
        {
          id: "doc-01",
          docType: "OPERATING_LICENSE",
          fileName: "business_registration_oasis_villa.pdf",
          fileSize: 2450000,
          fileUrl: "/docs/sample-operating-license.pdf",
          uploadedAt: "2026-10-06T09:00:00Z",
        },
        {
          id: "doc-02",
          docType: "FIRE_SAFETY",
          fileName: "fire_safety_cert_2026.pdf",
          fileSize: 1850000,
          fileUrl: "/docs/sample-pccc.pdf",
          uploadedAt: "2026-10-06T09:15:00Z",
        },
      ],
    },
  },
  "lst-rev-02": {
    title: "Central Da Nang Studio Apartment near My Khe Beach",
    description: "High-floor airy studio apartment just 200m walking distance to My Khe beach. Full building amenities including pool, gym, and 24/7 reception.",
    location: {
      province: "Da Nang",
      district: "Ngu Hanh Son District",
      exactAddress: "88 Vo Nguyen Giap Street, My An Ward, Ngu Hanh Son District, Da Nang",
      exactLat: 16.0544,
      exactLng: 108.2435,
      publicArea: {
        centerLat: 16.0544,
        centerLng: 108.2435,
        radiusM: 500,
      },
    },
    houseRules: {
      smoking: false,
      pets: false,
      parties: false,
      quietHoursEnabled: true,
      quietHoursFrom: "22:00",
      quietHoursTo: "07:00",
      notes: "No parties, no pets, and maintain quiet hours after 22:00.",
    },
    photos: [
      {
        id: "p-11",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        caption: "Cozy and bright studio interior",
        order: 0,
      },
      {
        id: "p-12",
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        caption: "Working desk and compact kitchenette",
        order: 1,
      },
      {
        id: "p-13",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        caption: "Modern walk-in glass shower",
        order: 2,
      },
      {
        id: "p-14",
        url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
        caption: "Plush queen-sized comfortable bed",
        order: 3,
      },
      {
        id: "p-15",
        url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
        caption: "Balcony catching cool sea breezes",
        order: 4,
      },
    ],
    legal: {
      legalRegistrationNumber: "4801239999",
      legalDocs: [
        {
          id: "doc-11",
          docType: "OPERATING_LICENSE",
          fileName: "danang_business_license.pdf",
          fileSize: 1900000,
          fileUrl: "/docs/sample-danang-license.pdf",
          uploadedAt: "2026-10-07T10:00:00Z",
        },
      ],
    },
    duplicates: [
      {
        duplicateListingId: "lst-207",
        duplicateListingTitle: "Condotel My Khe Beachfront 12th Floor",
        duplicateHostId: "hst-999",
        duplicateHostName: "Blue Sea Hospitality LLC",
        similarity: "SAME_ADDRESS",
        exactAddress: "88 Vo Nguyen Giap Street, My An Ward, Ngu Hanh Son District, Da Nang",
      },
    ],
  },
  "lst-rev-03": {
    title: "Hanoi Old Quarter Private Room - Ta Hien Street",
    description: "Immerse in the heritage vibe right at the iconic Ta Hien junction, surrounded by bustling night street food and weekend pedestrian walks.",
    location: {
      province: "Hanoi",
      district: "Hoan Kiem District",
      exactAddress: "15 Ta Hien Street, Hang Buom Ward, Hoan Kiem District, Hanoi",
      exactLat: 21.0345,
      exactLng: 105.8521,
    },
    legal: {
      legalRegistrationNumber: "0100223344",
      legalDocs: [
        {
          id: "doc-21",
          docType: "OPERATING_LICENSE",
          fileName: "hospitality_license_tahien.pdf",
          fileSize: 1200000,
          fileUrl: "/docs/sample-tahien.jpg",
          uploadedAt: "2026-10-07T12:00:00Z",
        },
      ],
    },
  },
};

function localizeDetail(item: ListingReviewDetail, locale: string = "vi"): ListingReviewDetail {
  if (locale !== "en") return { ...item };
  const overlay = EN_LISTING_OVERLAYS[item.id];
  if (!overlay) return { ...item };

  return {
    ...item,
    ...overlay,
    location: overlay.location ? { ...item.location, ...overlay.location } : item.location,
    photos: overlay.photos || item.photos,
    houseRules: overlay.houseRules ? { ...item.houseRules, ...overlay.houseRules } : item.houseRules,
    legal: overlay.legal ? { ...item.legal, ...overlay.legal } : item.legal,
    duplicates: overlay.duplicates || item.duplicates,
  };
}

let MOCK_DOC_VIEW_LOGS: ListingDocViewLogItem[] = [];

// ==========================================
// API IMPLEMENTATIONS
// ==========================================

export async function getListingReviewQueue(
  filters: ListingReviewQueueFilter = {},
  locale: string = "vi"
): Promise<ListingReviewQueueResponse> {
  await new Promise((r) => setTimeout(r, 200));

  let rawItems = [...MOCK_LISTING_QUEUE];
  let items = rawItems.map((it) => localizeDetail(it, locale));

  // Search query (title, hostName, exactAddress, id)
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.host.fullName.toLowerCase().includes(q) ||
        item.location.exactAddress.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }

  // Filter by region/province
  if (filters.region && filters.region !== "ALL") {
    items = items.filter((item) => item.location.province === filters.region);
  }

  // Filter by duplicate flag
  if (filters.flag === "DUPLICATE_ONLY") {
    items = items.filter((item) => item.duplicates.length > 0);
  } else if (filters.flag === "CLEAN_ONLY") {
    items = items.filter((item) => item.duplicates.length === 0);
  }

  // Filter by status
  if (filters.status && filters.status !== "ALL") {
    items = items.filter((item) => item.status === filters.status);
  }

  // Filter by onlyMine (locked by current admin)
  if (filters.onlyMine) {
    items = items.filter(
      (item) => item.lockedBy?.adminId === CURRENT_ADMIN_DEFAULT.id
    );
  }

  // Sort: Oldest submitted first (FIFO for queue fairness)
  items.sort(
    (a, b) =>
      new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  );

  const page = filters.page || 1;
  const pageSize = filters.pageSize || 10;
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginated = items.slice(startIndex, startIndex + pageSize);

  const queueItems: ListingReviewQueueItem[] = paginated.map((item) => ({
    id: item.id,
    title: item.title,
    coverPhotoUrl: item.photos[0]?.url,
    propertyType: item.propertyType,
    hostId: item.host.id,
    hostName: item.host.fullName,
    hostVerified: item.host.identityStatus === "VERIFIED",
    regionName: item.location.province,
    districtName: item.location.district,
    exactAddress: item.location.exactAddress,
    submittedAt: item.submittedAt,
    revisionNo: item.revisionNo,
    status: item.status,
    flagDuplicateAddress: item.duplicates.length > 0,
    duplicateAlert: item.duplicates[0],
    lockedBy: item.lockedBy,
    basePrice: item.pricing.baseNightlyPrice,
    currency: item.pricing.currency,
  }));

  return {
    items: queueItems,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getListingReviewDetail(
  id: string,
  locale: string = "vi"
): Promise<ListingReviewDetail> {
  await new Promise((r) => setTimeout(r, 200));

  const found = MOCK_LISTING_QUEUE.find((item) => item.id === id);
  if (!found) {
    throw new AppApiError({ detail: "Không tìm thấy hồ sơ thẩm định chỗ nghỉ", status: 404, code: "NOT_FOUND" });
  }

  return localizeDetail(found, locale);
}

export async function acquireListingReviewLock(
  id: string,
  adminId: string = CURRENT_ADMIN_DEFAULT.id,
  adminName: string = CURRENT_ADMIN_DEFAULT.name
): Promise<{ success: boolean; lockedBy: { adminId: string; adminName: string; lockedAt: string } }> {
  await new Promise((r) => setTimeout(r, 150));

  const target = MOCK_LISTING_QUEUE.find((item) => item.id === id);
  if (!target) {
    throw new AppApiError({ detail: "Không tìm thấy hồ sơ thẩm định", status: 404, code: "NOT_FOUND" });
  }

  const LOCK_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins
  const now = Date.now();

  if (target.lockedBy && target.lockedBy.adminId !== adminId) {
    const lockAge = now - new Date(target.lockedBy.lockedAt).getTime();
    if (lockAge < LOCK_TIMEOUT_MS) {
      throw new AppApiError({
        detail: `Hồ sơ đang được ${target.lockedBy.adminName} xử lý từ ${new Date(
          target.lockedBy.lockedAt
        ).toLocaleTimeString()}`,
        status: 409,
        code: "LOCKED_BY_ANOTHER",
      });
    }
  }

  // Acquire or refresh lock
  target.lockedBy = {
    adminId,
    adminName,
    lockedAt: new Date().toISOString(),
  };

  return {
    success: true,
    lockedBy: target.lockedBy,
  };
}

export async function heartbeatListingReviewLock(
  id: string,
  adminId: string = CURRENT_ADMIN_DEFAULT.id
): Promise<boolean> {
  const target = MOCK_LISTING_QUEUE.find((item) => item.id === id);
  if (!target || !target.lockedBy || target.lockedBy.adminId !== adminId) {
    return false;
  }
  target.lockedBy.lockedAt = new Date().toISOString();
  return true;
}

export async function releaseListingReviewLock(
  id: string,
  adminId: string = CURRENT_ADMIN_DEFAULT.id
): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 100));

  const target = MOCK_LISTING_QUEUE.find((item) => item.id === id);
  if (target && target.lockedBy && target.lockedBy.adminId === adminId) {
    target.lockedBy = null;
    return true;
  }
  return false;
}

export async function logDocumentView(
  listingId: string,
  docId: string,
  adminId: string = CURRENT_ADMIN_DEFAULT.id,
  adminName: string = CURRENT_ADMIN_DEFAULT.name
): Promise<ListingDocViewLogItem> {
  await new Promise((r) => setTimeout(r, 100));

  const logItem: ListingDocViewLogItem = {
    id: `log-${Date.now()}`,
    listingId,
    docId,
    adminId,
    adminName,
    viewedAt: new Date().toISOString(),
  };

  MOCK_DOC_VIEW_LOGS.push(logItem);
  return logItem;
}

export async function submitListingDecision(
  id: string,
  payload: ListingReviewDecisionPayload,
  adminId: string = CURRENT_ADMIN_DEFAULT.id,
  adminName: string = CURRENT_ADMIN_DEFAULT.name
): Promise<{
  success: boolean;
  nextListingId?: string;
  message: string;
}> {
  await new Promise((r) => setTimeout(r, 300));

  const target = MOCK_LISTING_QUEUE.find((item) => item.id === id);
  if (!target) {
    throw new AppApiError({ detail: "Không tìm thấy hồ sơ thẩm định", status: 404, code: "NOT_FOUND" });
  }

  // Validate duplicate address acknowledgment if duplicate flagged
  if (
    payload.decision === "APPROVE" &&
    target.duplicates.length > 0 &&
    !payload.acknowledgedDuplicateAddress
  ) {
    throw new AppApiError({
      detail: "Bạn phải xác nhận đã kiểm tra cảnh báo trùng địa chỉ trước khi phê duyệt",
      status: 422,
      code: "UNACKNOWLEDGED_DUPLICATE",
    });
  }

  // Validate reasons for NEEDS_CHANGES
  if (payload.decision === "NEEDS_CHANGES") {
    if (!payload.reasons || payload.reasons.length === 0) {
      throw new AppApiError({
        detail: "Bắt buộc chọn ít nhất 1 mục cần chỉnh sửa kèm hướng dẫn chi tiết cho Host",
        status: 422,
        code: "MISSING_REASONS",
      });
    }
    for (const r of payload.reasons) {
      if (!r.note || r.note.trim().length < 10) {
        throw new AppApiError({
          detail: `Ghi chú cho phần ${r.section} phải có ít nhất 10 ký tự`,
          status: 422,
          code: "REASON_NOTE_TOO_SHORT",
        });
      }
    }
  }

  // Validate notes for REJECT
  if (payload.decision === "REJECT" && (!payload.note || payload.note.trim().length < 10)) {
    throw new AppApiError({
      detail: "Lý do từ chối hồ sơ phải có ít nhất 10 ký tự",
      status: 422,
      code: "REJECT_NOTE_TOO_SHORT",
    });
  }

  // Update listing status
  if (payload.decision === "APPROVE") {
    target.status = "APPROVED";
  } else if (payload.decision === "NEEDS_CHANGES") {
    target.status = "NEEDS_CHANGES";
  } else if (payload.decision === "REJECT") {
    target.status = "REJECTED";
  }

  // Record audit log
  if (!target.activityLogs) target.activityLogs = [];
  target.activityLogs.push({
    id: `act-${Date.now()}`,
    adminId,
    adminName,
    action: `DECISION_${payload.decision}`,
    note: payload.note || (payload.reasons ? JSON.stringify(payload.reasons) : undefined),
    createdAt: new Date().toISOString(),
  });

  // Release lock
  target.lockedBy = null;

  // Find next pending listing in queue
  const nextPending = MOCK_LISTING_QUEUE.find(
    (item) => item.id !== id && item.status === "PENDING_REVIEW" && !item.lockedBy
  );

  return {
    success: true,
    nextListingId: nextPending?.id,
    message:
      payload.decision === "APPROVE"
        ? "Đã phê duyệt listing thành công. Chỗ nghỉ đã được công khai trên hệ thống."
        : payload.decision === "NEEDS_CHANGES"
        ? "Đã gửi yêu cầu chỉnh sửa tới Host thành công."
        : "Đã từ chối listing thành công.",
  };
}
