"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { AgentTabs } from "@/src/components/agents/AgentTabs";
import { useAgent } from "@/src/hooks/queries/agents";

export default function AgentConfigPage() {
  const params = useParams<{ id: string }>();
  const agentId = params.id;
  const { data: agent, isLoading } = useAgent(agentId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/agents"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Back to agents
        </Link>
      </div>
      <div className="flex items-start gap-4 border-b pb-5">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-primary">
          <Bot className="size-6" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {isLoading ? (
            <Skeleton className="h-7 w-56" />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">
              {agent?.name ?? "Agent"}
            </h1>
          )}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : agent ? (
              <>
                <Badge variant={agent.isActive ? "default" : "secondary"}>
                  {agent.isActive ? "Live" : "Paused"}
                </Badge>
                <span>·</span>
                <span>
                  {agent.isConfigured ? "Configured" : "Not yet configured"}
                </span>
                <span>·</span>
                <span className="font-mono text-[10px]">
                  {agent.agentId.slice(0, 8)}…
                </span>
              </>
            ) : (
              <span>Agent not found</span>
            )}
          </div>
        </div>
      </div>
      <AgentTabs agentId={agentId} />
    </div>
  );
}
