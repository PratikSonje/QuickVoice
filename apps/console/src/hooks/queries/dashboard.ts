"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardSummary,
  type DashboardRange,
} from "@/src/lib/api/resources/dashboard";
import { queryKeys } from "@/src/lib/query-keys";

export function useDashboardSummary(range: DashboardRange) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(range),
    queryFn: () => getDashboardSummary(range),
  });
}
