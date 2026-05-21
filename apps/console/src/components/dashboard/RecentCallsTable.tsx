"use client";

import Link from "next/link";
import { ArrowRight, Clock3, PhoneCall } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/common/EmptyState";
import type { DashboardSummary } from "@/src/lib/api/resources/dashboard";
import type { CallStatus } from "@/src/lib/api/types";

function statusVariant(
  status: CallStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "COMPLETED":
      return "default";
    case "FAILED":
    case "NOT_ANSWERED":
      return "destructive";
    case "IN_PROGRESS":
    case "SCHEDULED":
    case "PROCESSED":
      return "secondary";
    default:
      return "outline";
  }
}

function statusClass(status: CallStatus) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
    case "FAILED":
    case "NOT_ANSWERED":
      return "border-destructive/25 bg-destructive/10 text-destructive";
    case "IN_PROGRESS":
      return "border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-300";
    default:
      return "border-border bg-muted/50 text-muted-foreground";
  }
}

function formatRelative(iso: string | null) {
  if (!iso) return "No start time";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "0s";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m ? `${m}m ${s}s` : `${s}s`;
}

function formatStatus(status: string) {
  return status.toLowerCase().replace("_", " ");
}

export function RecentCallsTable({
  summary,
  loading,
}: {
  summary?: DashboardSummary;
  loading?: boolean;
}) {
  return (
    <div className="border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Live log
          </p>
          <h3 className="mt-1 text-base font-semibold text-foreground">
            Recent calls
          </h3>
          <p className="text-xs text-muted-foreground">
            Latest call activity across all agents.
          </p>
        </div>
        <Link
          href="/calls"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2 p-5">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !summary?.recent.length ? (
        <EmptyState
          icon={PhoneCall}
          title="No calls yet"
          description="Once your agents take calls, they'll show up here."
          className="border-0"
        />
      ) : (
        <div>
          <div className="hidden grid-cols-[1fr_130px_140px_40px] border-b bg-muted/20 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Caller</span>
            <span className="text-right">Duration</span>
            <span>Status</span>
            <span />
          </div>
          <div className="divide-y">
            {summary.recent.map((call) => (
              <Link
                key={call.callId}
                href={`/calls/${call.callId}`}
                className="group grid gap-3 px-5 py-3 transition-colors hover:bg-muted/40 sm:grid-cols-[1fr_130px_140px_40px] sm:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {call.callerId ?? "Unknown caller"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatRelative(call.startTime)} / {call.direction ?? "unknown"}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-xs text-muted-foreground sm:justify-end sm:text-right">
                  <Clock3 className="size-3 sm:hidden" />
                  <div>
                    <p className="font-medium text-foreground">
                      {formatDuration(call.durationSeconds)}
                    </p>
                    <p>duration</p>
                  </div>
                </div>
                <Badge
                  variant={statusVariant(call.status)}
                  className={`w-fit shrink-0 capitalize ${statusClass(call.status)}`}
                >
                  {formatStatus(call.status)}
                </Badge>
                <ArrowRight className="hidden size-4 justify-self-end text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:block" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
