"use client";

import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, PhoneCall } from "lucide-react";
import { Skeleton } from "@/src/components/ui/skeleton";
import { EmptyState } from "@/src/components/common/EmptyState";
import { useAgents } from "@/src/hooks/queries/agents";
import type { DashboardSummary } from "@/src/lib/api/resources/dashboard";

export function AgentActivityList({
  summary,
  loading,
}: {
  summary?: DashboardSummary;
  loading?: boolean;
}) {
  const { data: agents } = useAgents();
  const nameFor = (id: string | null) =>
    agents?.find((agent) => agent.agentId === id)?.name ?? "Unassigned";

  const top = summary?.topAgents ?? [];
  const max = top[0]?.calls ?? 1;
  const totalCalls = top.reduce((sum, agent) => sum + agent.calls, 0);

  return (
    <div className="border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Agent activity
          </p>
          <h3 className="mt-1 text-base font-semibold text-foreground">Top agents</h3>
          <p className="text-xs text-muted-foreground">
            Ranked by call volume in this period.
          </p>
        </div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Manage <ArrowRight className="size-3" />
        </Link>
      </div>
      <div className="grid grid-cols-2 border-b bg-muted/20 text-xs">
        <div className="border-r px-5 py-3">
          <p className="font-semibold text-foreground">{top.length}</p>
          <p className="text-muted-foreground">active agents</p>
        </div>
        <div className="px-5 py-3">
          <p className="font-semibold text-foreground">{totalCalls}</p>
          <p className="text-muted-foreground">assigned calls</p>
        </div>
      </div>
      {loading ? (
        <div className="space-y-4 p-5">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : !top.length ? (
        <EmptyState
          icon={Bot}
          title="No agent activity"
          description="Create an agent and connect it to a number to see activity."
          className="border-0"
        />
      ) : (
        <div className="space-y-4 p-5">
          {top.map((agent, index) => {
            const pct = Math.max(4, Math.round((agent.calls / max) * 100));
            const successPct = Math.round(agent.successRate * 100);
            return (
              <div key={agent.agentId ?? "unknown"} className="border bg-background p-3">
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center border bg-card text-xs font-semibold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {nameFor(agent.agentId)}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <PhoneCall className="size-3" />
                            {agent.calls} calls
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            {successPct}% success
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">{agent.minutes}m</p>
                        <p>talk time</p>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
