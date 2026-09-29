import { z } from "zod";

export const VULN_TYPES = [
  "XSS",
  "SQLi",
  "IDOR",
  "RCE",
  "SSRF",
  "CSRF",
  "XXE",
  "LFI",
  "RFI",
  "Authentication Bypass",
  "Authorization Bypass",
  "Information Disclosure",
  "Business Logic",
  "Open Redirect",
  "Clickjacking",
  "Race Condition",
  "Denial of Service",
  "Subdomain Takeover",
  "Insecure Deserialization",
  "Other",
] as const;

export const SEVERITY_LEVELS = [
  "None",
  "Low",
  "Medium",
  "High",
  "Critical",
] as const;

export const createReportSchema = z.object({
  programId: z.string().uuid(),
  title: z.string().min(5).max(300),
  description: z.string().min(20).max(50000),
  stepsToReproduce: z.string().min(10).max(50000),
  vulnType: z.string().min(1).max(100),
  severity: z.string().min(1).max(20),
  cvssScore: z.number().min(0).max(10).optional(),
});

export const updateReportStatusSchema = z.object({
  status: z.enum([
    "NEW",
    "TRIAGED",
    "ACCEPTED",
    "RESOLVED",
    "CLOSED",
    "DUPLICATE",
    "INFORMATIVE",
    "OUT_OF_SCOPE",
    "NOT_APPLICABLE",
    "SPAM",
  ]),
  priority: z
    .enum(["P1_CRITICAL", "P2_HIGH", "P3_MEDIUM", "P4_LOW", "P5_INFO"])
    .optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
  isInternal: z.boolean().default(false),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
