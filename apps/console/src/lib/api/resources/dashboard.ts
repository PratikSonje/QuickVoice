import { callsApi } from "@/src/lib/api/resources/calls";
import type { CallLog } from "@/src/lib/api/types";

export type DashboardRange = "24h" | "7d" | "30d";

export interface DashboardSeriesPoint {
  t: string;
  count: number;
  minutes: number;
}

export interface AgentBucket {
  agentId: string | null;
  count: number;
  minutes: number;
}

export interface DashboardSummary {
  totalCalls: number;
  totalMinutes: number;
  avgDurationSeconds: number;
  successRate: number;
  series: DashboardSeriesPoint[];
  topAgents: AgentBucket[];
  recent: CallLog[];
}

function rangeToFrom(range: DashboardRange): string {
  const now = Date.now();
  const ms =
    range === "24h" ? 24 * 3600_000 : range === "7d" ? 7 * 86400_000 : 30 * 86400_000;
  return new Date(now - ms).toISOString();
}

function bucketFor(range: DashboardRange, iso: string): string {
  const d = new Date(iso);
  if (range === "24h") {
    d.setMinutes(0, 0, 0);
    return d.toISOString();
  }
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

// TODO(backend): replace with `GET /v1/dashboard/summary?range=...` when the
// endpoint lands. Client-side aggregation is only accurate for the first page
// of calls returned by the list endpoint.
export async function getDashboardSummary(
  range: DashboardRange
): Promise<DashboardSummary> {
  const from = rangeToFrom(range);
  const page = await callsApi.list({ from, limit: 100 });
  const calls = page.data;

  const totalCalls = calls.length;
  const completedDurations = calls
    .map((c) => c.durationSeconds ?? 0)
    .filter((s) => s > 0);
  const totalSeconds = completedDurations.reduce((a, b) => a + b, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const avgDurationSeconds = completedDurations.length
    ? Math.round(totalSeconds / completedDurations.length)
    : 0;
  const successRate = calls.length
    ? calls.filter((c) => c.status === "COMPLETED").length / calls.length
    : 0;

  const seriesMap = new Map<string, DashboardSeriesPoint>();
  for (const c of calls) {
    if (!c.startTime) continue;
    const key = bucketFor(range, c.startTime);
    const bucket =
      seriesMap.get(key) ?? { t: key, count: 0, minutes: 0 };
    bucket.count += 1;
    bucket.minutes += Math.round((c.durationSeconds ?? 0) / 60);
    seriesMap.set(key, bucket);
  }
  const series = Array.from(seriesMap.values()).sort((a, b) =>
    a.t.localeCompare(b.t)
  );

  const agentMap = new Map<string | null, AgentBucket>();
  for (const c of calls) {
    const bucket =
      agentMap.get(c.agentId) ?? { agentId: c.agentId, count: 0, minutes: 0 };
    bucket.count += 1;
    bucket.minutes += Math.round((c.durationSeconds ?? 0) / 60);
    agentMap.set(c.agentId, bucket);
  }
  const topAgents = Array.from(agentMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recent = [...calls]
    .sort((a, b) => (b.startTime ?? "").localeCompare(a.startTime ?? ""))
    .slice(0, 10);

  return {
    totalCalls,
    totalMinutes,
    avgDurationSeconds,
    successRate,
    series,
    topAgents,
    recent,
  };
}
