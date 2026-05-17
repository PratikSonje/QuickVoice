"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";
import { useTranscript } from "@/src/hooks/queries/calls";

export function Transcript({ callId }: { callId: string }) {
  const q = useTranscript(callId);
  const rows = q.data?.pages.flatMap((p) => p.data) ?? [];

  if (q.isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!rows.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No transcript captured for this call.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((r) => {
        const isAgent = r.speaker === "agent" || r.speaker === "assistant";
        return (
          <div
            key={r.callTransId}
            className={cn(
              "flex flex-col gap-1 rounded-xl border p-3",
              isAgent
                ? "border-primary/20 bg-primary/5"
                : "bg-card"
            )}
          >
            <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>{r.speaker}</span>
              <span>{new Date(r.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-sm text-foreground">{r.messageText}</p>
          </div>
        );
      })}
      {q.hasNextPage ? (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => q.fetchNextPage()}
            disabled={q.isFetchingNextPage}
          >
            {q.isFetchingNextPage ? (
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
