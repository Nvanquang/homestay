import {
  ListingCardDTO,
  PopularDestination,
  DestinationSuggestion,
  SearchFilterState,
  SearchResultsResponse,
} from "../types";

export const MOCK_POPULAR_DESTINATIONS: PopularDestination[] = [
  {
    id: "dest-dalat",
    regionId: "dalat",
    name: "Đà Lạt, Lâm Đồng",
    imageUrl: "https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=800&q=80",
    listingCount: 148,
    startingPrice: 650000,
  },
  {
    id: "dest-hoian",
    regionId: "hoian",
    name: "Hội An, Quảng Nam",
    imageUrl: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80",
    listingCount: 92,
    startingPrice: 580000,
  },
  {
    id: "dest-sapa",
    regionId: "sapa",
    name: "Sa Pa, Lào Cai",
    imageUrl: "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
    listingCount: 76,
    startingPrice: 720000,
  },
  {
    id: "dest-vungtau",
    regionId: "vungtau",
    name: "Vũng Tàu, Bà Rịa",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    listingCount: 110,
    startingPrice: 850000,
  },
  {
    id: "dest-hanoi",
    regionId: "hanoi",
    name: "Hà Nội (Phố Cổ)",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    listingCount: 205,
    startingPrice: 500000,
  },
  {
    id: "dest-saigon",
    regionId: "saigon",
    name: "TP. Hồ Chí Minh",
    imageUrl: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=800&q=80",
    listingCount: 180,
    startingPrice: 620000,
  },
  {
    id: "dest-phuquoc",
    regionId: "phuquoc",
    name: "Phú Quốc, Kiên Giang",
    imageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    listingCount: 88,
    startingPrice: 1200000,
  },
  {
    id: "dest-ninhbinh",
    regionId: "ninhbinh",
    name: "Tràng An, Ninh Bình",
    imageUrl: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    listingCount: 64,
    startingPrice: 590000,
  },
];

export const MOCK_SEARCH_LISTINGS: ListingCardDTO[] = [
  {
    id: "lst-dl-01",
    title: "Mây Lang Thang Homestay - View Đồi Thông Bạt Ngàn",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Phường 3, Đà Lạt",
    photos: [
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "kitchen", "parking", "bbq", "mountain_view"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 1250000,
      basePrice: 1250000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 11.9365, lng: 108.4412 },
    rating: 4.92,
    reviewCount: 84,
    isFavorite: false,
    isSuperhost: true,
  },
  {
    id: "lst-dl-02",
    title: "Nhà Gỗ Mộc Châu Giữa Thung Lũng Rừng Thông",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Phường 10, Đà Lạt",
    photos: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    bookingMode: "REQUEST",
    cancellationPolicy: "MODERATE",
    amenities: ["wifi", "kitchen", "fireplace", "parking", "garden"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 1800000,
      basePrice: 1800000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 11.9482, lng: 108.4623 },
    rating: 4.88,
    reviewCount: 52,
    isFavorite: true,
    isSuperhost: false,
  },
  {
    id: "lst-dl-03",
    title: "The Kupid Hill - Phòng Kính Đón Bình Minh",
    propertyType: "PRIVATE_ROOM",
    areaLabel: "Phường 3, Đà Lạt",
    photos: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "balcony", "breakfast", "coffee_maker"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 750000,
      basePrice: 750000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 11.9298, lng: 108.4489 },
    rating: 4.95,
    reviewCount: 120,
    isFavorite: false,
    isSuperhost: true,
  },
  {
    id: "lst-ha-01",
    title: "An Bang Seaside Villa - 2 Bước Ra Biển Cực Chill",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Biển An Bàng, Hội An",
    photos: [
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 5,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "pool", "kitchen", "beachfront", "bbq", "ac"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 2200000,
      basePrice: 2200000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 15.9124, lng: 108.3371 },
    rating: 4.96,
    reviewCount: 95,
    isFavorite: false,
    isSuperhost: true,
  },
  {
    id: "lst-ha-02",
    title: "Phố Cổ Cổ Kính - Nhà Cổ 100 Năm Phong Cách Indochine",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Minh An, Phố Cổ Hội An",
    photos: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    bookingMode: "REQUEST",
    cancellationPolicy: "STRICT",
    amenities: ["wifi", "kitchen", "bicycle", "ac", "workspace"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 1450000,
      basePrice: 1450000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 15.8778, lng: 108.3289 },
    rating: 4.85,
    reviewCount: 44,
    isFavorite: false,
    isSuperhost: false,
  },
  {
    id: "lst-sp-01",
    title: "Eco Palms House - Bungalow Mộc Giữa Ruộng Bậc Thang",
    propertyType: "PRIVATE_ROOM",
    areaLabel: "Bản Lao Chải, Sa Pa",
    photos: [
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "mountain_view", "fireplace", "breakfast", "heater"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 1100000,
      basePrice: 1100000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 22.3167, lng: 103.8642 },
    rating: 4.94,
    reviewCount: 112,
    isFavorite: true,
    isSuperhost: true,
  },
  {
    id: "lst-vt-01",
    title: "The Ocean View Penthouse - Hồ Bơi Vô Cực Riêng",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Bãi Sau, Vũng Tàu",
    photos: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 3,
    bookingMode: "INSTANT",
    cancellationPolicy: "MODERATE",
    amenities: ["wifi", "pool", "kitchen", "ocean_view", "bbq", "elevator"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 3500000,
      basePrice: 3500000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 10.3392, lng: 107.0864 },
    rating: 4.9,
    reviewCount: 68,
    isFavorite: false,
    isSuperhost: true,
  },
  {
    id: "lst-hn-01",
    title: "Old Quarter Heritage Studio - Căn Hộ Pháp Cổ Giữa Lòng Thủ Đô",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Hoàn Kiếm, Hà Nội",
    photos: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "kitchen", "ac", "workspace", "washing_machine"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 680000,
      basePrice: 680000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 21.0333, lng: 105.8501 },
    rating: 4.87,
    reviewCount: 79,
    isFavorite: false,
    isSuperhost: false,
  },
  {
    id: "lst-sg-01",
    title: "Saigon River Sky Loft - Căn Hộ Tầng Cao View Sông Landmark 81",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Quận 1, TP. Hồ Chí Minh",
    photos: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1502005229762-ee1b41916327?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 3,
    bedrooms: 1,
    beds: 2,
    bathrooms: 1,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "pool", "gym", "kitchen", "ac", "city_view"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 1150000,
      basePrice: 1150000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 10.7769, lng: 106.7009 },
    rating: 4.93,
    reviewCount: 140,
    isFavorite: true,
    isSuperhost: true,
  },
  {
    id: "lst-pq-01",
    title: "Sunset Sanato Beach Villa - Biệt Thự Hồ Bơi Cạnh Biển Bãi Trường",
    propertyType: "ENTIRE_PLACE",
    areaLabel: "Dương Tơ, Phú Quốc",
    photos: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 3,
    bookingMode: "REQUEST",
    cancellationPolicy: "MODERATE",
    amenities: ["wifi", "pool", "beachfront", "kitchen", "bbq", "garden"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 3800000,
      basePrice: 3800000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 10.1652, lng: 103.9687 },
    rating: 4.89,
    reviewCount: 41,
    isFavorite: false,
    isSuperhost: false,
  },
  {
    id: "lst-nb-01",
    title: "Tràng An River Homestay - Chèo Thuyền Kayak Ngay Trước Cửa",
    propertyType: "PRIVATE_ROOM",
    areaLabel: "Hoa Lư, Ninh Bình",
    photos: [
      "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "kayak", "bicycle", "mountain_view", "breakfast"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 650000,
      basePrice: 650000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 20.2506, lng: 105.9084 },
    rating: 4.96,
    reviewCount: 88,
    isFavorite: false,
    isSuperhost: true,
  },
  {
    id: "lst-dl-04",
    title: "Tiệm Cà Phê & Homestay Túi Mơ To - View Thung Lũng Đèn",
    propertyType: "PRIVATE_ROOM",
    areaLabel: "Phường 11, Đà Lạt",
    photos: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    ],
    maxGuests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    bookingMode: "INSTANT",
    cancellationPolicy: "FLEXIBLE",
    amenities: ["wifi", "garden", "coffee_shop", "mountain_view"],
    price: {
      mode: "FROM_NIGHTLY",
      nightlyAvg: 850000,
      basePrice: 850000,
      includesFeesAndTaxes: true,
    },
    map: { lat: 11.9567, lng: 108.4812 },
    rating: 4.91,
    reviewCount: 204,
    isFavorite: false,
    isSuperhost: true,
  },
];

export async function getDestinationSuggestions(query: string): Promise<DestinationSuggestion[]> {
  const q = query.trim().toLowerCase();
  if (!q) {
    return [
      { id: "sug-dl", label: "Đà Lạt, Lâm Đồng", sublabel: "Điểm đến phổ biến · 148 chỗ ở", type: "REGION", listingCount: 148 },
      { id: "sug-ha", label: "Hội An, Quảng Nam", sublabel: "Phố cổ di sản · 92 chỗ ở", type: "REGION", listingCount: 92 },
      { id: "sug-sp", label: "Sa Pa, Lào Cai", sublabel: "Ruộng bậc thang & Mây mù · 76 chỗ ở", type: "REGION", listingCount: 76 },
      { id: "sug-vt", label: "Vũng Tàu, Bà Rịa", sublabel: "Biển gần Sài Gòn · 110 chỗ ở", type: "REGION", listingCount: 110 },
      { id: "sug-hn", label: "Hà Nội", sublabel: "Phố cổ 36 phố phường · 205 chỗ ở", type: "REGION", listingCount: 205 },
    ];
  }

  const results: DestinationSuggestion[] = [];

  // Filter regions
  MOCK_POPULAR_DESTINATIONS.forEach((d) => {
    if (d.name.toLowerCase().includes(q)) {
      results.push({
        id: d.id,
        label: d.name,
        sublabel: `Khu vực · ${d.listingCount} chỗ ở`,
        type: "REGION",
        listingCount: d.listingCount,
      });
    }
  });

  // Filter listings
  MOCK_SEARCH_LISTINGS.forEach((l) => {
    if (
      l.title.toLowerCase().includes(q) ||
      l.areaLabel.toLowerCase().includes(q)
    ) {
      results.push({
        id: l.id,
        label: l.title,
        sublabel: l.areaLabel,
        type: "LISTING",
        lat: l.map.lat,
        lng: l.map.lng,
      });
    }
  });

  return results.slice(0, 7);
}

export async function getPopularDestinations(): Promise<PopularDestination[]> {
  return MOCK_POPULAR_DESTINATIONS;
}

export async function getFeaturedListings(): Promise<ListingCardDTO[]> {
  return MOCK_SEARCH_LISTINGS.slice(0, 8);
}

function calculateNightCount(checkin: string, checkout: string): number {
  if (!checkin || !checkout) return 0;
  const d1 = new Date(checkin);
  const d2 = new Date(checkout);
  const diffTime = d2.getTime() - d1.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export async function searchListings(filters: Partial<SearchFilterState>): Promise<SearchResultsResponse> {
  let list = [...MOCK_SEARCH_LISTINGS];

  // 1. Destination text or region
  if (filters.destination && filters.destination.trim()) {
    const dest = filters.destination.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.areaLabel.toLowerCase().includes(dest) ||
        item.title.toLowerCase().includes(dest)
    );
  }

  // 2. Guests
  const totalGuests = (filters.adults || 1) + (filters.children || 0);
  if (totalGuests > 1) {
    list = list.filter((item) => item.maxGuests >= totalGuests);
  }

  // 3. Property Type
  if (filters.type && filters.type !== "ALL") {
    list = list.filter((item) => item.propertyType === filters.type);
  }

  // 4. Bedrooms
  if (filters.bedrooms && filters.bedrooms > 0) {
    if (filters.bedrooms >= 4) {
      list = list.filter((item) => item.bedrooms >= 4);
    } else {
      list = list.filter((item) => item.bedrooms >= filters.bedrooms!);
    }
  }

  // 5. Instant booking
  if (filters.instant) {
    list = list.filter((item) => item.bookingMode === "INSTANT");
  }

  // 6. Amenities
  if (filters.amenities && filters.amenities.length > 0) {
    list = list.filter((item) =>
      filters.amenities!.every((a) => item.amenities.includes(a))
    );
  }

  // 7. Cancellation Policy
  if (filters.policy && filters.policy.length > 0) {
    list = list.filter((item) => filters.policy!.includes(item.cancellationPolicy));
  }

  // 8. Bounding Box [minLng, minLat, maxLng, maxLat]
  if (filters.bbox) {
    const parts = filters.bbox.split(",").map(Number);
    if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
      const [minLng, minLat, maxLng, maxLat] = parts;
      list = list.filter(
        (item) =>
          item.map.lng >= minLng &&
          item.map.lng <= maxLng &&
          item.map.lat >= minLat &&
          item.map.lat <= maxLat
      );
    }
  }

  // 9. Pricing calculations with dates
  const nights = calculateNightCount(filters.checkin || "", filters.checkout || "");

  const processedList = list.map((item) => {
    const nightlyPrice = item.price.nightlyAvg || item.price.basePrice || 1000000;
    if (nights > 0) {
      const total = nightlyPrice * nights;
      return {
        ...item,
        price: {
          mode: "TOTAL" as const,
          total,
          nightlyAvg: nightlyPrice,
          nights,
          includesFeesAndTaxes: true,
          basePrice: item.price.basePrice,
        },
      };
    } else {
      return {
        ...item,
        price: {
          mode: "FROM_NIGHTLY" as const,
          nightlyAvg: nightlyPrice,
          basePrice: item.price.basePrice,
          includesFeesAndTaxes: true,
        },
      };
    }
  });

  // 10. Filter by price range
  let priceFiltered = processedList;
  if (filters.minPrice !== undefined && filters.minPrice > 0) {
    priceFiltered = priceFiltered.filter((item) => {
      const comparePrice =
        item.price.mode === "TOTAL"
          ? item.price.total || 0
          : item.price.nightlyAvg || 0;
      return comparePrice >= filters.minPrice!;
    });
  }
  if (filters.maxPrice !== undefined && filters.maxPrice < 15000000) {
    priceFiltered = priceFiltered.filter((item) => {
      const comparePrice =
        item.price.mode === "TOTAL"
          ? item.price.total || 0
          : item.price.nightlyAvg || 0;
      return comparePrice <= filters.maxPrice!;
    });
  }

  // 11. Sort
  const sortMode = filters.sort || "RELEVANCE";
  priceFiltered.sort((a, b) => {
    const priceA =
      a.price.mode === "TOTAL" ? a.price.total || 0 : a.price.nightlyAvg || 0;
    const priceB =
      b.price.mode === "TOTAL" ? b.price.total || 0 : b.price.nightlyAvg || 0;

    if (sortMode === "PRICE_ASC") return priceA - priceB;
    if (sortMode === "PRICE_DESC") return priceB - priceA;
    if (sortMode === "NEWEST") return b.id.localeCompare(a.id);
    return b.rating - a.rating; // RELEVANCE defaults to rating
  });

  // 12. Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 24;
  const startIndex = (page - 1) * limit;
  const pagedItems = priceFiltered.slice(0, startIndex + limit);

  // Map Markers
  const mapMarkers = priceFiltered.map((l) => {
    const rawPrice =
      l.price.mode === "TOTAL" ? l.price.total || 0 : l.price.nightlyAvg || 0;
    const formattedShort =
      rawPrice >= 1000000
        ? `${(rawPrice / 1000000).toFixed(1).replace(".0", "")}tr ₫`
        : `${Math.round(rawPrice / 1000)}k ₫`;

    return {
      id: l.id,
      lat: l.map.lat,
      lng: l.map.lng,
      priceLabel: formattedShort,
      title: l.title,
    };
  });

  return {
    items: pagedItems,
    total: priceFiltered.length,
    page,
    limit,
    hasMore: pagedItems.length < priceFiltered.length,
    appliedFilters: filters,
    facets: {
      priceRange: { min: 500000, max: 5000000 },
      totalCountByRegion: {
        dalat: 148,
        hoian: 92,
        sapa: 76,
      },
    },
    mapMarkers,
  };
}

export async function getSearchCount(filters: Partial<SearchFilterState>): Promise<number> {
  const res = await searchListings(filters);
  return res.total;
}
