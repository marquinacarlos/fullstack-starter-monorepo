import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ItemSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  created_at: z.string(),
});
export type Item = z.infer<typeof ItemSchema>;

export const ItemListSchema = z.array(ItemSchema);

export const ItemCreateSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
});
export type ItemCreate = z.infer<typeof ItemCreateSchema>;

export const DatabaseStatusSchema = z.object({
  name: z.string(),
  label: z.string(),
  status: z.enum(["connected", "disabled", "unavailable"]),
});
export type DatabaseStatus = z.infer<typeof DatabaseStatusSchema>;

export const DatabasesResponseSchema = z.object({
  databases: z.array(DatabaseStatusSchema),
});
