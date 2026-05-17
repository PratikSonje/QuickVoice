"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/common/EmptyState";
import { PhoneCall } from "lucide-react";
import { useAgents } from "@/src/hooks/queries/agents";
import { useCalls } from "@/src/hooks/queries/calls";
import type { CallListParams } from "@/src/lib/api/resources/calls";
import type { CallLog, CallStatus } from "@/src/lib/api/types";

function statusVariant(s: CallStatus): "default" | "secondary" | "destructive" {
  if (s === "COMPLETED") return "default";
  if (s === "FAILED" || s === "NOT_ANSWERED") return "destructive";
  return "secondary";
}

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function fmtDuration(s: number | null) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m ? `${m}m ${r}s` : `${r}s`;
}

export function CallsTable({
  filters,
}: {
  filters: Omit<CallListParams, "cursor" | "limit">;
}) {
  const { data: agents } = useAgents();
  const query = useCalls(filters);

  const calls: CallLog[] = query.data?.pages.flatMap((p) => p.data) ?? [];

  const agentName = (id: string | null) =>
    agents?.find((a) => a.agentId === id)?.name ?? "Unassigned";

  if (query.isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!calls.length) {
    return (
      <EmptyState
        icon={PhoneCall}
        title="No calls match these filters"
        description="Try a wider date range or remove a filter."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Caller</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Started</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {calls.map((c) => (
              <TableRow
                key={c.callId}
                className="cursor-pointer hover:bg-muted/40"
              >
                <TableCell>
                  <Link
                    href={`/calls/${c.callId}`}
                    className="block font-medium"
                  >
                    {c.callerId ?? "Unknown"}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {agentName(c.agentId)}
                </TableCell>
                <TableCell className="text-xs uppercase text-muted-foreground">
                  {c.direction ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(c.status)} className="uppercase text-[10px]">
                    {c.status.toLowerCase().replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{fmtDuration(c.durationSeconds)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {fmtTime(c.startTime)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {query.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
          >
            {query.isFetchingNextPage ? (
              <>
                <Loader2 className="animate-spin" /> Loading…
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
