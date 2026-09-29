import { z } from "zod";

export const createProgramSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(10000),
  scopes: z
    .array(
      z.object({
        target: z.string().min(1).max(500),
        type: z.enum(["web", "mobile", "api", "network", "iot", "other"]),
        inScope: z.boolean(),
        notes: z.string().max(1000).optional(),
      })
    )
    .min(1, "At least one scope item is required"),
  rules: z
    .array(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().min(1).max(5000),
      })
    )
    .optional(),
  rewards: z
    .array(
      z.object({
        priority: z.enum([
          "P1_CRITICAL",
          "P2_HIGH",
          "P3_MEDIUM",
          "P4_LOW",
          "P5_INFO",
        ]),
        minAmount: z.number().min(0).optional(),
        maxAmount: z.number().min(0).optional(),
        currency: z.string().max(3).default("USD"),
      })
    )
    .optional(),
});

export const updateProgramSchema = createProgramSchema.partial().extend({
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "CLOSED"]).optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
