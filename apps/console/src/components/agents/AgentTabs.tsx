"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Bot,
  AudioLines,
  Gauge,
  Webhook,
  Wrench,
  BookOpen,
  Settings,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/src/components/ui/tabs";
import { BehaviorTab } from "@/src/components/agents/tabs/BehaviorTab";
import { VoiceTab } from "@/src/components/agents/tabs/VoiceTab";
import { LimitsTab } from "@/src/components/agents/tabs/LimitsTab";
import { WebhooksTab } from "@/src/components/agents/tabs/WebhooksTab";
import { ToolsTab } from "@/src/components/agents/tabs/ToolsTab";
import { KnowledgeTab } from "@/src/components/agents/tabs/KnowledgeTab";
import { AdvancedTab } from "@/src/components/agents/tabs/AdvancedTab";

const TABS = [
  { id: "behavior", label: "Behavior", icon: Bot },
  { id: "voice", label: "Voice", icon: AudioLines },
  { id: "limits", label: "Limits", icon: Gauge },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "advanced", label: "Advanced", icon: Settings },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AgentTabs({ agentId }: { agentId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get("tab") ?? "behavior") as TabId;

  function onChange(value: string) {
    const next = new URLSearchParams(params);
    next.set("tab", value);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <Tabs value={current} onValueChange={onChange} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto rounded-xl border bg-card p-1">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <t.icon className="size-4" />
            <span>{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="behavior" className="mt-6">
        <BehaviorTab agentId={agentId} />
      </TabsContent>
      <TabsContent value="voice" className="mt-6">
        <VoiceTab agentId={agentId} />
      </TabsContent>
      <TabsContent value="limits" className="mt-6">
        <LimitsTab />
      </TabsContent>
      <TabsContent value="webhooks" className="mt-6">
        <WebhooksTab agentId={agentId} />
      </TabsContent>
      <TabsContent value="tools" className="mt-6">
        <ToolsTab />
      </TabsContent>
      <TabsContent value="knowledge" className="mt-6">
        <KnowledgeTab agentId={agentId} />
      </TabsContent>
      <TabsContent value="advanced" className="mt-6">
        <AdvancedTab agentId={agentId} />
      </TabsContent>
    </Tabs>
  );
}
