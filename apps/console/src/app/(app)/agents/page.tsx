"use client";

import { Bot } from "lucide-react";
import { PageHeader } from "@/src/components/common/PageHeader";
import { EmptyState } from "@/src/components/common/EmptyState";
import { AgentCard } from "@/src/components/agents/AgentCard";
import { NewAgentDialog } from "@/src/components/agents/NewAgentDialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAgents } from "@/src/hooks/queries/agents";

export default function AgentsPage() {
  const { data: agents, isLoading } = useAgents();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Agents"
        description="Voice agents you can deploy to phone numbers."
        actions={<NewAgentDialog />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : !agents?.length ? (
        <EmptyState
          icon={Bot}
          title="No agents yet"
          description="Create your first voice agent and connect it to a phone number."
          action={<NewAgentDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <AgentCard key={a.agentId} agent={a} />
          ))}
        </div>
      )}
    </div>
  );
}
