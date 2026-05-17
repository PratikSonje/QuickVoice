"use client";

import { Wrench } from "lucide-react";
import { EmptyState } from "@/src/components/common/EmptyState";

export function ToolsTab() {
  return (
    <EmptyState
      icon={Wrench}
      title="Tools are coming soon"
      description="Connect HTTP tools to let the agent call your APIs mid-conversation."
    />
  );
}
