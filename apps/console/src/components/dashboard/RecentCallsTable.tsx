"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/common/EmptyState";
import { PhoneCall } from "lucide-react";
import type { DashboardSummary } from "@/src/lib/api/resources/dashboard";
import type { CallStatus } from "@/src/lib/api/types";

function statusVariant(status: CallStatus): "default" | "secondary" | "destructive" | "outline" {
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

function formatRelative(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function formatDuration(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m}m ${r}s` : `${r}s`;
}

export function RecentCallsTable({
  summary,
  loading,
}: {
  summary?: DashboardSummary;
  loading?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <h3 className="text-sm font-semibold text-foreground">Recent calls</h3>
        <Link
          href="/calls"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ArrowRight className="size-3" />
        </Link>
      </div>
      {loading ? (
        <div className="space-y-2 p-5">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
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
        <div className="divide-y">
          {summary.recent.map((c) => (
            <Link
              key={c.callId}
              href={`/calls/${c.callId}`}
              className="group flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="min-w-0 space-y-0.5">
                <p className="truncate text-sm font-medium">
                  {c.callerId ?? "Unknown caller"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatRelative(c.startTime)} · {formatDuration(c.durationSeconds)}
                </p>
              </div>
              <Badge variant={statusVariant(c.status)} className="shrink-0">
                {c.status.toLowerCase().replace("_", " ")}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
