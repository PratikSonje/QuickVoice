import { z } from "zod";
import { TelephonyProvider } from "../../../prisma/generated/prisma/client.js";

const providerSchema = z.preprocess((value) => {
  if (typeof value === "string") return value.toUpperCase();
  return value;
}, z.nativeEnum(TelephonyProvider));

export const quickOutboundCallSchema = z.object({
  agentId: z.string().uuid(),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  fromNumber: z.string().min(10, "From number must be at least 10 digits"),
  firstMessage: z.string().optional(),
  systemPrompt: z.string().optional(),
  username: z.string().optional(),
  provider: providerSchema.optional(),
  sid: z.string().min(1, "Provider SID is required").optional(),
});

export type QuickOutboundCallInput = z.infer<typeof quickOutboundCallSchema>;
export type QuickOutboundCallArgs = QuickOutboundCallInput & {
  organizationId: string;
  userId: string;
};

const supportedBatchExtension = /\.(csv|xls|xlsx)$/i;

export const batchUploadUrlQuerySchema = z.object({
  fileName: z.string().min(1).refine((value) => supportedBatchExtension.test(value), {
    message: "Batch file must be a CSV, XLS, or XLSX file",
  }),
  contentType: z.string().min(1),
});

export const createBatchCampaignSchema = z
  .object({
    name: z.string().trim().min(1, "Campaign name is required"),
    agentId: z.string().uuid(),
    fromNumber: z.string().min(10, "From number must be at least 10 digits"),
    sourceFileKey: z.string().min(1, "Uploaded file key is required"),
    sourceFileName: z.string().min(1, "Uploaded file name is required"),
    scheduledAt: z.coerce.date().optional().nullable(),
    timezone: z.string().trim().min(1).default("UTC"),
    ringingTimeoutSeconds: z.coerce.number().int().min(10).max(180).default(60),
  })
  .strip();

export const listBatchCampaignsQuerySchema = z.object({
  agentId: z.string().uuid().optional(),
});

export type BatchUploadUrlQuery = z.infer<typeof batchUploadUrlQuerySchema>;
export type CreateBatchCampaignInput = z.infer<typeof createBatchCampaignSchema>;
export type CreateBatchCampaignArgs = CreateBatchCampaignInput & {
  organizationId: string;
  userId: string;
};
export type ListBatchCampaignsArgs = z.infer<typeof listBatchCampaignsQuerySchema> & {
  organizationId: string;
};
