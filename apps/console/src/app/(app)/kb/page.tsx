"use client";

import { BookOpen, FileText, Link as LinkIcon } from "lucide-react";

import { PageHeader } from "@/src/components/common/PageHeader";
import { EmptyState } from "@/src/components/common/EmptyState";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { UploadDialog } from "@/src/components/kb/UploadDialog";
import { DeleteKbButton } from "@/src/components/kb/DeleteKbButton";
import { useKbSources } from "@/src/hooks/queries/kb";
import { useAgents } from "@/src/hooks/queries/agents";
import type { KbSourceType } from "@/src/lib/api/types";

const ICON: Record<KbSourceType, typeof FileText> = {
  PDF: FileText,
  TXT: FileText,
  DOCX: FileText,
  CSV: FileText,
  URL: LinkIcon,
};

export default function KbPage() {
  const { data: sources, isLoading } = useKbSources();
  const { data: agents } = useAgents();
  const agentName = (id: string | null) =>
    agents?.find((a) => a.agentId === id)?.name;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Knowledge base"
        description="Documents your agents can reference when RAG is enabled."
        actions={<UploadDialog />}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : !sources?.length ? (
        <EmptyState
          icon={BookOpen}
          title="No documents yet"
          description="Add a URL to create a knowledge source, then attach it to an agent."
          action={<UploadDialog />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => {
            const Icon = ICON[s.sourceType] ?? FileText;
            const attached = agentName(s.agentId);
            return (
              <div
                key={s.kbId}
                className="flex flex-col gap-3 rounded-2xl border bg-card p-5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant={s.status === "ACTIVE" ? "default" : "secondary"}
                      className="uppercase"
                    >
                      {s.status.toLowerCase()}
                    </Badge>
                    <DeleteKbButton kbId={s.kbId} name={s.name} />
                  </div>
                </div>
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{s.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.originalFileName ?? s.sourceType} · uploaded{" "}
                    {new Date(s.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                {attached ? (
                  <p className="text-xs text-muted-foreground">
                    Attached to <span className="font-medium">{attached}</span>
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">Unassigned</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
