"use client";

import { Music } from "lucide-react";

export function AudioPlayer({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div className="flex items-center gap-3 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <Music className="size-4" />
        No recording available for this call.
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <audio
        controls
        src={src}
        preload="metadata"
        className="w-full"
      />
    </div>
  );
}
