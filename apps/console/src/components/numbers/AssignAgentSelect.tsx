"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { useAgents } from "@/src/hooks/queries/agents";
import { useUpdateNumber } from "@/src/hooks/queries/numbers";

const UNASSIGNED = "__unassigned__";

export function AssignAgentSelect({
  phId,
  agentId,
}: {
  phId: string;
  agentId: string | null;
}) {
  const { data: agents } = useAgents();
  const update = useUpdateNumber();

  function onChange(value: string) {
    const next = value === UNASSIGNED ? null : value;
    update.mutate({ phId, input: { agentId: next } });
  }

  return (
    <Select value={agentId ?? UNASSIGNED} onValueChange={onChange}>
      <SelectTrigger className="h-8 w-[180px] text-xs">
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {(agents ?? []).map((a) => (
          <SelectItem key={a.agentId} value={a.agentId}>
            {a.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
