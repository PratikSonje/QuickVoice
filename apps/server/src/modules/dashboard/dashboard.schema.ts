import { z } from "zod";

export const dashboardRangeSchema = z.object({
  range: z.enum(["24h", "7d", "30d"]).default("7d"),
});

export type DashboardRange = z.infer<typeof dashboardRangeSchema>["range"];
export type DashboardSummaryArgs = {
  organizationId: string;
  range: DashboardRange;
};
