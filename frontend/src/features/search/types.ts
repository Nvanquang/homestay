export type PropertyType = "ENTIRE_PLACE" | "PRIVATE_ROOM" | "SHARED_ROOM" | "HOTEL_ROOM";

export type BookingMode = "INSTANT" | "REQUEST";

export type CancellationPolicyType = "FLEXIBLE" | "MODERATE" | "STRICT";

export type SearchSortOption = "RELEVANCE" | "PRICE_ASC" | "PRICE_DESC" | "NEWEST";

export interface DestinationSuggestion {
  id: string;
  label: string;
  sublabel: string;
  type: "REGION" | "LISTING";
  listingCount?: number;
  lat?: number;
  lng?: number;
}

export interface PopularDestination {
  id: string;
  regionId: string;
  name: string;
  imageUrl: string;
  listingCount: number;
  startingPrice: number;
}

export interface ListingPriceDTO {
  mode: "TOTAL" | "FROM_NIGHTLY";
  total?: number;
  nightlyAvg?: number;
  nights?: number;
  includesFeesAndTaxes: boolean;
  basePrice?: number;
}

export interface ListingCardDTO {
  id: string;
  title: string;
  propertyType: PropertyType;
  areaLabel: string;
  photos: string[];
  maxGuests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  bookingMode: BookingMode;
  cancellationPolicy: CancellationPolicyType;
  amenities: string[];
  price: ListingPriceDTO;
  map: {
    lat: number;
    lng: number;
  };
  rating: number;
  reviewCount: number;
  isFavorite?: boolean;
  isSuperhost?: boolean;
}

export interface SearchFilterState {
  destination: string;
  checkin: string;
  checkout: string;
  adults: number;
  children: number;
  infants?: number;
  minPrice: number;
  maxPrice: number;
  type: "ALL" | "ENTIRE_PLACE" | "PRIVATE_ROOM";
  bedrooms: number; // 0 = Any, 1..4 (4+)
  beds: number;
  amenities: string[];
  instant: boolean;
  policy: CancellationPolicyType[];
  sort: SearchSortOption;
  bbox?: string; // minLng,minLat,maxLng,maxLat
  page: number;
  limit: number;
}

export interface SearchResultsResponse {
  items: ListingCardDTO[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  appliedFilters: Partial<SearchFilterState>;
  facets: {
    priceRange: { min: number; max: number };
    totalCountByRegion: Record<string, number>;
  };
  mapMarkers: Array<{
    id: string;
    lat: number;
    lng: number;
    priceLabel: string;
    title: string;
  }>;
}
