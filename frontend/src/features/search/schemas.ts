import { z } from "zod";

export const searchFilterSchema = z.object({
  destination: z.string().default(""),
  checkin: z.string().default(""),
  checkout: z.string().default(""),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
  infants: z.coerce.number().min(0).default(0),
  minPrice: z.coerce.number().min(0).default(0),
  maxPrice: z.coerce.number().min(0).default(15000000),
  type: z.enum(["ALL", "ENTIRE_PLACE", "PRIVATE_ROOM"]).default("ALL"),
  bedrooms: z.coerce.number().min(0).default(0),
  beds: z.coerce.number().min(0).default(0),
  amenities: z.array(z.string()).default([]),
  instant: z.boolean().default(false),
  policy: z.array(z.enum(["FLEXIBLE", "MODERATE", "STRICT"])).default([]),
  sort: z.enum(["RELEVANCE", "PRICE_ASC", "PRICE_DESC", "NEWEST"]).default("RELEVANCE"),
  bbox: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).default(24),
});

export type SearchFilterSchemaType = z.infer<typeof searchFilterSchema>;
