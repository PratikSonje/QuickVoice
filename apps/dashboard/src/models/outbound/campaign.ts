import { z } from "zod";

export const campaignSchema = z.object({
    name: z.string().min(1,"Name is required"),
    agentId: z.string().uuid(),
    file: z.instanceof(File),
    fromNumber: z.string().min(10,"From number must be at least 10 digits"),
  });