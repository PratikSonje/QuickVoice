import Link from "next/link";
import { Bot, BookOpen, Phone, ChevronRight, Dot } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import type { Agent } from "@/src/lib/api/types";
import { cn } from "@/src/lib/utils";

export function AgentCard({ agent }: { agent: Agent }) {
 return (
 <Link
 href={`/agents/${agent.agentId}`}
 className="group relative flex flex-col gap-4 overflow-hidden border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md"
 >
 <div
 aria-hidden
 className="pointer-events-none absolute -right-10 -top-10 size-32 bg-gradient-to-br from-primary/20 to-transparent opacity-0 blur-2xl transition-opacity group-hover:opacity-100"
 />
 <div className="flex items-start justify-between gap-3">
 <div className="flex size-10 items-center justify-center bg-gradient-to-br from-primary/30 to-primary/5 text-primary">
 <Bot className="size-5" />
 </div>
 <Badge
 variant={agent.isActive ? "default" : "secondary"}
 className={cn(
 "gap-1 uppercase tracking-wide",
 agent.isActive ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20" : ""
 )}
 >
 <Dot className="-mx-1 size-4" />
 {agent.isActive ? "Live" : "Paused"}
 </Badge>
 </div>
 <div className="space-y-1">
 <h3 className="font-semibold text-foreground group-hover:text-primary">
 {agent.name}
 </h3>
 <p className="text-xs text-muted-foreground">
 {agent.isConfigured ? "Configured" : "Not configured"}
 </p>
 </div>
 <div className="mt-auto flex items-center gap-4 text-xs text-muted-foreground">
 <span className="inline-flex items-center gap-1">
 <Phone className="size-3.5" />
 {agent.phoneNumbersCount}
 </span>
 <span className="inline-flex items-center gap-1">
 <BookOpen className="size-3.5" />
 {agent.knowledgeSourcesCount}
 </span>
 <span className="ml-auto inline-flex items-center gap-1 text-primary opacity-0 transition-opacity group-hover:opacity-100">
 Open <ChevronRight className="size-3" />
 </span>
 </div>
 </Link>
 );
}
