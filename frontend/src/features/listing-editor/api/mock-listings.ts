import {
  ListingItem,
  ListingFilterParams,
  BasicInfoData,
  LocationData,
  ListingPhotoItem,
  WizardStepId,
  BookingRulesData,
  PricingData,
  PolicyData,
  CancellationPolicyType,
  BookingMode,
  LegalData,
  LegalDocItem,
  LegalDocType,
  ListingReadinessResult,
  ReadinessItem,
  ListingReviewStatusDetail,
  ListingStatus,
} from "../types";

let mockListings: ListingItem[] = [
  {
    id: "lst-101",
    hostId: "user-host-1",
    status: "PUBLISHED",
    version: 3,
    basicInfo: {
      propertyType: "ENTIRE_PLACE",
      title: "Nhà gỗ trên đồi thông mộng mơ Đà Lạt",
      description:
        "Tận hưởng không gian thanh bình tuyệt đối giữa rừng thông Đà Lạt. Nhà gỗ mộc mạc trang bị đầy đủ lò sưởi, ban công ngắm bình minh và bếp nấu tiện nghi cho cả gia đình.",
      maxGuests: 4,
      bedrooms: 2,
      beds: 3,
      bathrooms: 2,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      currency: "VND",
    },
    location: {
      province: "Lâm Đồng",
      district: "Thành phố Đà Lạt",
      exactAddress: "12/4 Đường Khởi Nghĩa Bắc Sơn, Phường 10, TP. Đà Lạt",
      exactLat: 11.9382,
      exactLng: 108.4452,
      publicArea: {
        centerLat: 11.94,
        centerLng: 108.44,
        radiusM: 500,
        label: "Phường 10, Đà Lạt",
      },
    },
    photos: [
      {
        id: "p-101",
        url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
        order: 0,
        caption: "Toàn cảnh ban công ngắm đồi",
        status: "READY",
      },
      {
        id: "p-102",
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
        order: 1,
        caption: "Phòng khách ấm cúng",
        status: "READY",
      },
      {
        id: "p-103",
        url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
        order: 2,
        caption: "Phòng ngủ chính",
        status: "READY",
      },
      {
        id: "p-104",
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        order: 3,
        caption: "Phòng tắm rộng rãi",
        status: "READY",
      },
      {
        id: "p-105",
        url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
        order: 4,
        caption: "Khu vực bếp nấu",
        status: "READY",
      },
    ],
    coverPhotoUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    amenityIds: ["amenity-wifi", "amenity-aircon", "amenity-tv", "amenity-kitchen"],
    bookingRules: {
      minNights: 1,
      maxNights: 30,
      prepNights: 0,
      minNoticeHours: 0,
      maxAdvanceMonths: 12,
      houseRules: {
        smoking: false,
        pets: true,
        parties: false,
        quietHoursEnabled: false,
        quietHoursFrom: "22:00",
        quietHoursTo: "07:00",
        notes: "",
      },
    },
    pricing: {
      baseNightlyPrice: 1200000,
      weekendNightlyPrice: 1400000,
      cleaningFee: 200000,
      baseGuests: 2,
      extraGuestFee: 100000,
      weeklyDiscountPct: 10,
      monthlyDiscountPct: 20,
      currency: "VND",
    },
    cancellationPolicy: "FLEXIBLE",
    bookingMode: "INSTANT",
    legalDocs: [
      {
        id: "doc-lst-101",
        type: "OPERATING_LICENSE",
        name: "so_do_da_lat.pdf",
        fileUrl: "/docs/so_do_da_lat.pdf",
        sizeBytes: 2500000,
        uploadedAt: new Date(Date.now() - 10 * 86400 * 1000).toISOString(),
      },
    ],
    draftProgress: {
      completedSteps: 8,
      totalSteps: 8,
      resumeStep: "basic",
    },
    updatedAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400 * 1000).toISOString(),
    capabilities: {
      canEdit: true,
      canPreview: true,
      canViewStatus: true,
      canOpenCalendar: true,
      canOpenPricing: true,
      canDelete: false, // published listing cannot be deleted
    },
  },
  {
    id: "lst-draft-demo",
    hostId: "user-host-1",
    status: "DRAFT",
    version: 1,
    basicInfo: {
      propertyType: "PRIVATE_ROOM",
      title: "Căn hộ Studio view biển Nha Trang",
      description:
        "Căn hộ studio cao cấp tầng cao với tầm nhìn trực diện biển Nha Trang. Thích hợp cho cặp đôi nghỉ dưỡng cuối tuần hoặc chuyên gia công tác dài ngày.",
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      currency: "VND",
    },
    location: {
      province: "Khánh Hòa",
      district: "Thành phố Nha Trang",
      exactAddress: "02 Đường Trần Phú, Lộc Thọ, Nha Trang",
      exactLat: 12.2388,
      exactLng: 109.1967,
      publicArea: {
        centerLat: 12.24,
        centerLng: 109.2,
        radiusM: 500,
        label: "Lộc Thọ, Nha Trang",
      },
    },
    photos: [
      {
        id: "p-201",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        order: 0,
        caption: "Phòng ngủ view biển",
        status: "READY",
      },
      {
        id: "p-202",
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        order: 1,
        caption: "Góc làm việc và ban công",
        status: "READY",
      },
    ],
    coverPhotoUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    draftProgress: {
      completedSteps: 2,
      totalSteps: 8,
      resumeStep: "photos",
    },
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    capabilities: {
      canEdit: true,
      canPreview: true,
      canViewStatus: false,
      canOpenCalendar: false,
      canOpenPricing: false,
      canDelete: true,
    },
  },
  {
    id: "lst-102",
    hostId: "user-host-1",
    status: "DRAFT",
    version: 1,
    basicInfo: {
      propertyType: "PRIVATE_ROOM",
      title: "Căn hộ Studio view biển Nha Trang",
      description:
        "Căn hộ studio cao cấp tầng cao với tầm nhìn trực diện biển Nha Trang. Thích hợp cho cặp đôi nghỉ dưỡng cuối tuần hoặc chuyên gia công tác dài ngày.",
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      currency: "VND",
    },
    location: {
      province: "Khánh Hòa",
      district: "Thành phố Nha Trang",
      exactAddress: "02 Đường Trần Phú, Lộc Thọ, Nha Trang",
      exactLat: 12.2388,
      exactLng: 109.1967,
      publicArea: {
        centerLat: 12.24,
        centerLng: 109.2,
        radiusM: 500,
        label: "Lộc Thọ, Nha Trang",
      },
    },
    photos: [
      {
        id: "p-201",
        url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        order: 0,
        caption: "Phòng ngủ view biển",
        status: "READY",
      },
      {
        id: "p-202",
        url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        order: 1,
        caption: "Góc làm việc và ban công",
        status: "READY",
      },
    ],
    coverPhotoUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    draftProgress: {
      completedSteps: 2,
      totalSteps: 8,
      resumeStep: "photos",
    },
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400 * 1000).toISOString(),
    capabilities: {
      canEdit: true,
      canPreview: true,
      canViewStatus: false,
      canOpenCalendar: false,
      canOpenPricing: false,
      canDelete: true,
    },
  },
  {
    id: "lst-pending-demo",
    hostId: "user-host-1",
    status: "PENDING_REVIEW",
    version: 2,
    basicInfo: {
      propertyType: "ENTIRE_PLACE",
      title: "Biệt thự sân vườn view mây Tam Đảo",
      description:
        "Biệt thự phong cách Bắc Âu nằm trên triền đồi Tam Đảo mộng mơ, không gian tràn ngập ánh sáng tự nhiên với bể bơi nước ấm và khuôn viên tiệc BBQ ngoài trời.",
      maxGuests: 8,
      bedrooms: 4,
      beds: 5,
      bathrooms: 4,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      currency: "VND",
    },
    location: {
      province: "Vĩnh Phúc",
      district: "Huyện Tam Đảo",
      exactAddress: "Khu 1, Thị trấn Tam Đảo, Vĩnh Phúc",
      exactLat: 21.4589,
      exactLng: 105.6421,
    },
    photos: [
      { id: "p-301", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80", order: 0, status: "READY" },
      { id: "p-302", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80", order: 1, status: "READY" },
      { id: "p-303", url: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80", order: 2, status: "READY" },
      { id: "p-304", url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80", order: 3, status: "READY" },
      { id: "p-305", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80", order: 4, status: "READY" },
    ],
    coverPhotoUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    cancellationPolicy: "MODERATE",
    bookingMode: "INSTANT",
    legalDocs: [
      {
        id: "doc-1",
        type: "OPERATING_LICENSE",
        name: "so_do_tam_dao.pdf",
        fileUrl: "/mock-docs/so_do.pdf",
        sizeBytes: 2450000,
        uploadedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
    ],
    draftProgress: {
      completedSteps: 8,
      totalSteps: 8,
      resumeStep: "legal",
    },
    submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString(),
    reviewStatus: {
      listingId: "lst-pending-demo",
      title: "Biệt thự sân vườn view mây Tam Đảo",
      coverPhotoUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      status: "PENDING_REVIEW",
      submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      revisions: [
        {
          no: 1,
          submittedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          result: "PENDING",
        },
      ],
    },
    capabilities: {
      canEdit: false,
      canPreview: true,
      canViewStatus: true,
      canOpenCalendar: false,
      canOpenPricing: false,
      canDelete: false,
    },
  },
  {
    id: "lst-needs-changes-demo",
    hostId: "user-host-1",
    status: "NEEDS_CHANGES",
    version: 3,
    basicInfo: {
      propertyType: "ROOM",
      title: "Phòng áp mái phong cách Vintage Hội An",
      description:
        "Không gian hoài niệm giữa lòng phố cổ Hội An với mái ngói rêu phong, ban công hoa giấy rực rỡ và những tách trà chiều ngắm hoàng hôn sông Hoài.",
      maxGuests: 2,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
      checkInTime: "14:00",
      checkOutTime: "12:00",
      currency: "VND",
    },
    location: {
      province: "Quảng Nam",
      district: "Thành phố Hội An",
      exactAddress: "45 Đường Nguyễn Thái Học, Minh An, Hội An",
      exactLat: 15.8778,
      exactLng: 108.3283,
    },
    photos: [
      { id: "p-401", url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", order: 0, status: "READY" },
      { id: "p-402", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", order: 1, status: "READY" },
    ],
    coverPhotoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    cancellationPolicy: "FLEXIBLE",
    bookingMode: "REQUEST",
    draftProgress: {
      completedSteps: 6,
      totalSteps: 8,
      resumeStep: "photos",
    },
    submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 86400 * 1000).toISOString(),
    reviewStatus: {
      listingId: "lst-needs-changes-demo",
      title: "Phòng áp mái phong cách Vintage Hội An",
      coverPhotoUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      status: "NEEDS_CHANGES",
      submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      currentReview: {
        decidedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        reasons: [
          {
            section: "PHOTOS",
            note: "Ảnh phòng ngủ và góc ban công bị mờ, không đủ độ phân giải tối thiểu 1024x768. Đồng thời số lượng ảnh hiện chỉ có 2/5 ảnh tối thiểu.",
            stepNumber: 3,
            stepId: "photos",
          },
          {
            section: "LEGAL",
            note: "Chưa cung cấp giấy tờ chứng minh quyền kinh doanh lưu trú hoặc hợp đồng thuê nhà có thời hạn tại phố cổ.",
            stepNumber: 8,
            stepId: "legal",
          },
        ],
      },
      revisions: [
        {
          no: 1,
          submittedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          decidedAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
          result: "NEEDS_CHANGES",
          reasons: [
            {
              section: "PHOTOS",
              note: "Ảnh phòng ngủ và góc ban công bị mờ, không đủ độ phân giải tối thiểu 1024x768.",
              stepNumber: 3,
              stepId: "photos",
            },
            {
              section: "LEGAL",
              note: "Chưa cung cấp giấy tờ chứng minh quyền kinh doanh lưu trú.",
              stepNumber: 8,
              stepId: "legal",
            },
          ],
        },
      ],
    },
    capabilities: {
      canEdit: true,
      canPreview: true,
      canViewStatus: true,
      canOpenCalendar: false,
      canOpenPricing: false,
      canDelete: true,
    },
  },
];

export async function getHostListings(
  params: ListingFilterParams = {}
): Promise<{ items: ListingItem[]; total: number }> {
  await new Promise((r) => setTimeout(r, 100));

  let items = [...mockListings];

  if (params.status && params.status !== "ALL") {
    items = items.filter((item) => item.status === params.status);
  }

  if (params.query && params.query.trim()) {
    const q = params.query.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.basicInfo.title.toLowerCase().includes(q) ||
        item.location.district.toLowerCase().includes(q) ||
        item.location.province.toLowerCase().includes(q)
    );
  }

  // Sort updated most recently first
  items.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return {
    items: JSON.parse(JSON.stringify(items)),
    total: items.length,
  };
}

export async function getListingDetail(id: string): Promise<ListingItem> {
  await new Promise((r) => setTimeout(r, 80));
  const found = mockListings.find((item) => item.id === id);
  if (!found) {
    throw new Error("NOT_FOUND: Chỗ nghỉ không tồn tại hoặc đã bị xoá");
  }
  return JSON.parse(JSON.stringify(found));
}

export async function createDraftListing(
  initialBasicInfo: BasicInfoData
): Promise<ListingItem> {
  await new Promise((r) => setTimeout(r, 150));

  const newId = `lst-${Date.now().toString(36)}`;
  const now = new Date().toISOString();

  const newListing: ListingItem = {
    id: newId,
    hostId: "user-host-1",
    status: "DRAFT",
    version: 1,
    basicInfo: initialBasicInfo,
    location: {
      province: "Lâm Đồng",
      district: "Thành phố Đà Lạt",
      exactAddress: "",
      exactLat: 11.9404,
      exactLng: 108.4583,
    },
    photos: [],
    draftProgress: {
      completedSteps: 1,
      totalSteps: 8,
      resumeStep: "location",
    },
    updatedAt: now,
    createdAt: now,
    capabilities: {
      canEdit: true,
      canPreview: false,
      canViewStatus: false,
      canOpenCalendar: false,
      canOpenPricing: false,
      canDelete: true,
    },
  };

  mockListings.unshift(newListing);
  return JSON.parse(JSON.stringify(newListing));
}

export async function updateListingDraft(
  id: string,
  stepData: {
    basicInfo?: Partial<BasicInfoData>;
    location?: Partial<LocationData>;
    photos?: ListingPhotoItem[];
    amenityIds?: string[];
    bookingRules?: BookingRulesData;
    pricing?: PricingData;
    policy?: PolicyData;
    cancellationPolicy?: CancellationPolicyType;
    bookingMode?: BookingMode;
    legal?: LegalData;
    legalDocs?: LegalDocItem[];
    legalRegistrationNumber?: string;
    currentStep?: WizardStepId;
  },
  expectedVersion?: number
): Promise<ListingItem> {
  await new Promise((r) => setTimeout(r, 120));

  const index = mockListings.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("NOT_FOUND: Không tìm thấy listing để cập nhật");
  }

  const current = mockListings[index];

  // Concurrency check
  if (expectedVersion !== undefined && current.version !== expectedVersion) {
    throw new Error(
      "409 CONFLICT: Dữ liệu đã bị thay đổi ở một tab khác. Vui lòng tải lại trang."
    );
  }

  const updatedCancellationPolicy =
    stepData.cancellationPolicy ??
    stepData.policy?.cancellationPolicy ??
    current.cancellationPolicy ??
    current.policy?.cancellationPolicy;

  const updatedBookingMode =
    stepData.bookingMode ??
    stepData.policy?.bookingMode ??
    current.bookingMode ??
    current.policy?.bookingMode;

  const updatedLegalDocs =
    stepData.legalDocs ??
    stepData.legal?.legalDocs ??
    current.legalDocs ??
    current.legal?.legalDocs ??
    [];

  const updatedLegalRegistrationNumber =
    stepData.legalRegistrationNumber ??
    stepData.legal?.legalRegistrationNumber ??
    current.legalRegistrationNumber ??
    current.legal?.legalRegistrationNumber;

  const updated: ListingItem = {
    ...current,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
    basicInfo: {
      ...current.basicInfo,
      ...(stepData.basicInfo || {}),
    },
    location: {
      ...current.location,
      ...(stepData.location || {}),
    },
    photos: stepData.photos ?? current.photos,
    amenityIds: stepData.amenityIds ?? current.amenityIds,
    bookingRules: stepData.bookingRules ?? current.bookingRules,
    pricing: stepData.pricing ?? current.pricing,
    cancellationPolicy: updatedCancellationPolicy,
    bookingMode: updatedBookingMode,
    policy:
      updatedCancellationPolicy && updatedBookingMode
        ? {
            cancellationPolicy: updatedCancellationPolicy,
            bookingMode: updatedBookingMode,
          }
        : current.policy,
    legalDocs: updatedLegalDocs,
    legalRegistrationNumber: updatedLegalRegistrationNumber,
    legal: {
      legalDocs: updatedLegalDocs,
      legalRegistrationNumber: updatedLegalRegistrationNumber,
    },
  };

  if (updated.photos.length > 0) {
    updated.coverPhotoUrl = updated.photos[0].url;
  }

  // Update progress calculation (8 steps)
  let completed = 0;
  if (updated.basicInfo.title.length >= 10) completed += 1;
  if (updated.location.exactAddress.length >= 5) completed += 1;
  if (updated.photos.length >= 5) completed += 1;
  if (updated.amenityIds && updated.amenityIds.length >= 1) completed += 1;
  if (updated.bookingRules && updated.bookingRules.minNights <= updated.bookingRules.maxNights) completed += 1;
  if (updated.pricing && updated.pricing.baseNightlyPrice >= 10000) completed += 1;
  if (updated.cancellationPolicy && updated.bookingMode) completed += 1;
  if (updated.legalDocs && updated.legalDocs.length >= 1) completed += 1;

  updated.draftProgress.completedSteps = Math.max(
    updated.draftProgress.completedSteps,
    completed
  );

  mockListings[index] = updated;
  return JSON.parse(JSON.stringify(updated));
}

export async function uploadListingPhoto(
  listingId: string,
  file: File
): Promise<ListingPhotoItem> {
  await new Promise((r) => setTimeout(r, 150));

  // Max 10MB
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("FILE_TOO_LARGE: Ảnh không được vượt quá 10MB");
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("INVALID_FORMAT: Chỉ hỗ trợ định dạng JPG, PNG hoặc WebP");
  }

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  if (found.photos.length >= 30) {
    throw new Error("LIMIT_EXCEEDED: Mỗi chỗ nghỉ chỉ được tải tối đa 30 ảnh");
  }

  const objectUrl = URL.createObjectURL(file);
  const newPhoto: ListingPhotoItem = {
    id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    url: objectUrl,
    order: found.photos.length,
    caption: file.name.replace(/\.[^/.]+$/, ""),
    status: "READY",
  };

  found.photos.push(newPhoto);
  found.updatedAt = new Date().toISOString();
  if (found.photos.length === 1) {
    found.coverPhotoUrl = newPhoto.url;
  }

  return JSON.parse(JSON.stringify(newPhoto));
}

export async function reorderPhotos(
  listingId: string,
  photoIds: string[]
): Promise<ListingPhotoItem[]> {
  await new Promise((r) => setTimeout(r, 100));

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  const reordered: ListingPhotoItem[] = [];
  photoIds.forEach((pid, idx) => {
    const p = found.photos.find((item) => item.id === pid);
    if (p) {
      p.order = idx;
      reordered.push(p);
    }
  });

  found.photos = reordered;
  if (found.photos.length > 0) {
    found.coverPhotoUrl = found.photos[0].url;
  }
  found.updatedAt = new Date().toISOString();

  return JSON.parse(JSON.stringify(found.photos));
}

export async function deleteListingPhoto(
  listingId: string,
  photoId: string
): Promise<void> {
  await new Promise((r) => setTimeout(r, 80));

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  found.photos = found.photos
    .filter((p) => p.id !== photoId)
    .map((p, idx) => ({ ...p, order: idx }));

  found.coverPhotoUrl = found.photos.length > 0 ? found.photos[0].url : undefined;
  found.updatedAt = new Date().toISOString();
}

export async function deleteDraftListing(id: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));

  const found = mockListings.find((item) => item.id === id);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  if (found.status === "PUBLISHED") {
    throw new Error("CANNOT_DELETE: Không thể xoá phòng đang hiển thị hoặc có đặt phòng");
  }

  mockListings = mockListings.filter((item) => item.id !== id);
}

export async function updateListingAmenities(
  listingId: string,
  amenityIds: string[]
): Promise<ListingItem> {
  return updateListingDraft(listingId, { amenityIds, currentStep: "amenities" });
}

export async function updateListingBookingRules(
  listingId: string,
  rules: BookingRulesData
): Promise<ListingItem> {
  return updateListingDraft(listingId, { bookingRules: rules, currentStep: "rules" });
}

export async function updateListingPolicy(
  listingId: string,
  policy: PolicyData
): Promise<ListingItem> {
  return updateListingDraft(listingId, {
    policy,
    cancellationPolicy: policy.cancellationPolicy,
    bookingMode: policy.bookingMode,
    currentStep: "policy",
  });
}

export async function updateListingLegal(
  listingId: string,
  legal: LegalData
): Promise<ListingItem> {
  return updateListingDraft(listingId, {
    legal,
    legalDocs: legal.legalDocs,
    legalRegistrationNumber: legal.legalRegistrationNumber,
    currentStep: "legal",
  });
}

export async function uploadLegalDocument(
  listingId: string,
  file: File,
  type: LegalDocType = "OPERATING_LICENSE"
): Promise<LegalDocItem> {
  await new Promise((r) => setTimeout(r, 150));

  if (file.size > 15 * 1024 * 1024) {
    throw new Error("FILE_TOO_LARGE: Tài liệu không được vượt quá 15MB");
  }

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  const objectUrl = URL.createObjectURL(file);
  const newDoc: LegalDocItem = {
    id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type,
    name: file.name,
    fileUrl: objectUrl,
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };

  const existingDocs = found.legalDocs || found.legal?.legalDocs || [];
  const updatedDocs = [...existingDocs, newDoc];

  await updateListingDraft(listingId, {
    legalDocs: updatedDocs,
    legal: {
      legalDocs: updatedDocs,
      legalRegistrationNumber: found.legalRegistrationNumber,
    },
  });

  return newDoc;
}

export async function deleteLegalDocument(
  listingId: string,
  docId: string
): Promise<void> {
  await new Promise((r) => setTimeout(r, 80));

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  const existingDocs = found.legalDocs || found.legal?.legalDocs || [];
  const updatedDocs = existingDocs.filter((d) => d.id !== docId);

  await updateListingDraft(listingId, {
    legalDocs: updatedDocs,
    legal: {
      legalDocs: updatedDocs,
      legalRegistrationNumber: found.legalRegistrationNumber,
    },
  });
}

export async function checkListingReadiness(
  listingId: string
): Promise<ListingReadinessResult> {
  await new Promise((r) => setTimeout(r, 100));

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  const items: ReadinessItem[] = [];

  // 1. Basic Info
  const basicOk =
    Boolean(found.basicInfo?.title && found.basicInfo.title.length >= 10) &&
    Boolean(found.basicInfo?.description && found.basicInfo.description.length >= 50);
  items.push({
    key: "basicInfo",
    ok: basicOk,
    messageVi: basicOk
      ? "Thông tin cơ bản đầy đủ (tên, mô tả, sức chứa)"
      : "Thiếu thông tin cơ bản: Tên tối thiểu 10 ký tự, mô tả tối thiểu 50 ký tự",
    messageEn: basicOk
      ? "Basic info complete (title, description, capacity)"
      : "Incomplete basic info: Title min 10 chars, description min 50 chars",
    stepNumber: 1,
    stepId: "basic",
    linkUrl: `/host/listings/${listingId}/edit/1`,
  });

  // 2. Location
  const locOk = Boolean(
    found.location?.province &&
      found.location?.district &&
      found.location?.exactAddress &&
      found.location.exactAddress.length >= 5
  );
  items.push({
    key: "location",
    ok: locOk,
    messageVi: locOk
      ? "Vị trí & Ghim toạ độ trên bản đồ hoàn tất"
      : "Chưa hoàn tất định vị địa chỉ và ghim bản đồ",
    messageEn: locOk
      ? "Location & map coordinates complete"
      : "Address and map location incomplete",
    stepNumber: 2,
    stepId: "location",
    linkUrl: `/host/listings/${listingId}/edit/2`,
  });

  // 3. Photos
  const photosCount = found.photos?.length || 0;
  const photosOk = photosCount >= 5;
  items.push({
    key: "photos",
    ok: photosOk,
    messageVi: photosOk
      ? `Đã tải lên đủ ảnh chất lượng (${photosCount} ảnh)`
      : `Cần thêm ${5 - photosCount} ảnh (hiện có ${photosCount}/5 ảnh)`,
    messageEn: photosOk
      ? `Photos complete (${photosCount} photos uploaded)`
      : `Need ${5 - photosCount} more photo(s) (currently ${photosCount}/5)`,
    stepNumber: 3,
    stepId: "photos",
    linkUrl: `/host/listings/${listingId}/edit/3`,
  });

  // 4. Amenities
  const amenitiesCount = found.amenityIds?.length || 0;
  const amenitiesOk = amenitiesCount >= 1;
  items.push({
    key: "amenities",
    ok: amenitiesOk,
    messageVi: amenitiesOk
      ? `Đã chọn tiện nghi phục vụ (${amenitiesCount} tiện nghi)`
      : "Chưa chọn tiện nghi nào cho chỗ nghỉ",
    messageEn: amenitiesOk
      ? `Amenities selected (${amenitiesCount} items)`
      : "No amenities selected yet",
    stepNumber: 4,
    stepId: "amenities",
    linkUrl: `/host/listings/${listingId}/edit/4`,
  });

  // 5. Booking Rules
  const rulesOk = Boolean(
    found.bookingRules &&
      found.bookingRules.minNights > 0 &&
      found.bookingRules.minNights <= found.bookingRules.maxNights
  );
  items.push({
    key: "rules",
    ok: rulesOk,
    messageVi: rulesOk
      ? "Quy tắc lưu trú & Thời gian nhận/trả phòng hợp lệ"
      : "Chưa thiết lập quy tắc nhận phòng hoặc số đêm tối thiểu không hợp lệ",
    messageEn: rulesOk
      ? "House rules & minimum nights valid"
      : "House rules or minimum nights incomplete",
    stepNumber: 5,
    stepId: "rules",
    linkUrl: `/host/listings/${listingId}/edit/5`,
  });

  // 6. Pricing
  const priceOk = Boolean(
    found.pricing?.baseNightlyPrice && found.pricing.baseNightlyPrice >= 10000
  );
  items.push({
    key: "pricing",
    ok: priceOk,
    messageVi: priceOk
      ? "Giá thuê theo đêm đã được thiết lập"
      : "Chưa thiết lập giá thuê cơ bản (tối thiểu 10.000₫/đêm)",
    messageEn: priceOk
      ? "Nightly rate configured"
      : "Nightly base price not configured (min 10,000 VND)",
    stepNumber: 6,
    stepId: "pricing",
    linkUrl: `/host/listings/${listingId}/edit/6`,
  });

  // 7. Policy & Booking Mode
  const policyOk = Boolean(
    (found.cancellationPolicy || found.policy?.cancellationPolicy) &&
      (found.bookingMode || found.policy?.bookingMode)
  );
  items.push({
    key: "policy",
    ok: policyOk,
    messageVi: policyOk
      ? "Chính sách huỷ & Kiểu đặt phòng đã chọn"
      : "Chưa chọn chính sách huỷ hoặc kiểu đặt phòng",
    messageEn: policyOk
      ? "Cancellation policy & booking mode selected"
      : "Cancellation policy or booking mode not selected",
    stepNumber: 7,
    stepId: "policy",
    linkUrl: `/host/listings/${listingId}/edit/7`,
  });

  // 8. Legal Docs
  const legalDocsCount =
    (found.legalDocs?.length || found.legal?.legalDocs?.length || 0);
  const legalOk = legalDocsCount >= 1;
  items.push({
    key: "legal",
    ok: legalOk,
    messageVi: legalOk
      ? `Đã tải lên giấy tờ pháp lý/quyền khai thác (${legalDocsCount} tài liệu)`
      : "Thiếu giấy tờ chứng minh quyền khai thác/sở hữu homestay",
    messageEn: legalOk
      ? `Legal documents uploaded (${legalDocsCount} doc(s))`
      : "Missing operating license / ownership proof document",
    stepNumber: 8,
    stepId: "legal",
    linkUrl: `/host/listings/${listingId}/edit/8`,
  });

  // 9. Host Verification (H02)
  const hostVerified = true; // In mock environment host-1 is verified
  items.push({
    key: "hostVerification",
    ok: hostVerified,
    messageVi: hostVerified
      ? "Hồ sơ xác minh danh tính Host đã được duyệt"
      : "Hồ sơ xác minh danh tính Host chưa được duyệt (cần hoàn tất tại H02)",
    messageEn: hostVerified
      ? "Host identity verification approved"
      : "Host identity verification not approved yet (complete at H02)",
    stepNumber: 8,
    stepId: "legal",
    linkUrl: "/host/verification",
  });

  const canSubmit = items.every((i) => i.ok);

  return {
    canSubmit,
    items,
    summary: {
      id: found.id,
      title: found.basicInfo?.title || "Chưa đặt tên",
      coverPhotoUrl: found.coverPhotoUrl || found.photos?.[0]?.url,
      baseNightlyPrice: found.pricing?.baseNightlyPrice || 0,
      cancellationPolicy:
        found.cancellationPolicy || found.policy?.cancellationPolicy || "FLEXIBLE",
      bookingMode: found.bookingMode || found.policy?.bookingMode || "INSTANT",
      province: found.location?.province || "",
      district: found.location?.district || "",
    },
  };
}

export async function submitListingForReview(
  listingId: string
): Promise<{ status: ListingStatus; message: string }> {
  await new Promise((r) => setTimeout(r, 200));

  const readiness = await checkListingReadiness(listingId);
  if (!readiness.canSubmit) {
    const missing = readiness.items.filter((i) => !i.ok).map((i) => i.messageVi);
    throw new Error(
      `UNPROCESSABLE_ENTITY: Chỗ nghỉ chưa đủ điều kiện gửi duyệt: ${missing.join("; ")}`
    );
  }

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  const now = new Date().toISOString();
  found.status = "PENDING_REVIEW";
  found.submittedAt = now;
  found.updatedAt = now;
  found.version += 1;

  // Initialize or append revision
  if (!found.reviewStatus) {
    found.reviewStatus = {
      listingId: found.id,
      title: found.basicInfo.title,
      coverPhotoUrl: found.coverPhotoUrl,
      status: "PENDING_REVIEW",
      submittedAt: now,
      revisions: [
        {
          no: 1,
          submittedAt: now,
          result: "PENDING",
        },
      ],
    };
  } else {
    found.reviewStatus.status = "PENDING_REVIEW";
    found.reviewStatus.submittedAt = now;
    found.reviewStatus.revisions.unshift({
      no: found.reviewStatus.revisions.length + 1,
      submittedAt: now,
      result: "PENDING",
    });
  }

  found.capabilities = {
    ...found.capabilities,
    canEdit: false, // Read only while pending
    canViewStatus: true,
  };

  return {
    status: "PENDING_REVIEW",
    message: "Gửi duyệt chỗ nghỉ thành công. Ban quản trị sẽ thẩm định trong vòng 24–48 giờ.",
  };
}

export async function withdrawListingSubmission(
  listingId: string
): Promise<ListingItem> {
  await new Promise((r) => setTimeout(r, 120));

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy listing");
  }

  if (found.status !== "PENDING_REVIEW") {
    throw new Error("INVALID_STATE: Chỉ có thể rút lại yêu cầu khi đang ở trạng thái Chờ duyệt");
  }

  const now = new Date().toISOString();
  found.status = "DRAFT";
  found.updatedAt = now;
  found.version += 1;
  found.capabilities = {
    ...found.capabilities,
    canEdit: true,
    canViewStatus: true,
  };

  if (found.reviewStatus) {
    found.reviewStatus.status = "DRAFT";
  }

  return JSON.parse(JSON.stringify(found));
}

export async function getListingReviewStatus(
  listingId: string
): Promise<ListingReviewStatusDetail> {
  await new Promise((r) => setTimeout(r, 100));

  const found = mockListings.find((item) => item.id === listingId);
  if (!found) {
    throw new Error("NOT_FOUND: Không tìm thấy chỗ nghỉ");
  }

  if (found.reviewStatus) {
    return JSON.parse(JSON.stringify(found.reviewStatus));
  }

  // Construct default review status based on listing status
  const now = new Date().toISOString();
  const defaultStatus: ListingReviewStatusDetail = {
    listingId: found.id,
    title: found.basicInfo?.title || "Chỗ nghỉ",
    coverPhotoUrl: found.coverPhotoUrl || found.photos?.[0]?.url,
    status: found.status,
    submittedAt: found.submittedAt || found.updatedAt,
    revisions: [
      {
        no: 1,
        submittedAt: found.submittedAt || found.updatedAt,
        result:
          found.status === "PUBLISHED"
            ? "APPROVED"
            : found.status === "PENDING_REVIEW"
            ? "PENDING"
            : "PENDING",
      },
    ],
    publicUrl:
      found.status === "PUBLISHED" ? `/rooms/${found.id}` : undefined,
  };

  return defaultStatus;
}

export function _resetListingsDatabase(): void {
  // Reset for tests if needed
}

