import {
  ListingItem,
  ListingFilterParams,
  BasicInfoData,
  LocationData,
  ListingPhotoItem,
  WizardStepId,
  BookingRulesData,
  PricingData,
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
  };

  if (updated.photos.length > 0) {
    updated.coverPhotoUrl = updated.photos[0].url;
  }

  // Update progress calculation
  let completed = 0;
  if (updated.basicInfo.title.length >= 10) completed += 1;
  if (updated.location.exactAddress.length >= 5) completed += 1;
  if (updated.photos.length >= 1) completed += 1;
  if (updated.amenityIds && updated.amenityIds.length > 0) completed += 1;
  if (updated.bookingRules) completed += 1;
  if (updated.pricing && updated.pricing.baseNightlyPrice > 0) completed += 1;

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

export async function updateListingPricing(
  listingId: string,
  pricing: PricingData
): Promise<ListingItem> {
  return updateListingDraft(listingId, { pricing, currentStep: "pricing" });
}

export function _resetListingsDatabase(): void {
  // Reset for tests if needed
}
