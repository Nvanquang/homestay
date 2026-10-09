import { z } from "zod";

export const quoteRequestSchema = z.object({
  listingId: z.string().min(1),
  checkin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)"),
  checkout: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày không hợp lệ (YYYY-MM-DD)"),
  adults: z.coerce.number().min(1).default(1),
  children: z.coerce.number().min(0).default(0),
});

export type QuoteRequestSchemaType = z.infer<typeof quoteRequestSchema>;
