import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Skeleton } from "@/src/components/ui/skeleton";

export function StatCard({
  label,
  value,
  helper,
  icon: Icon,
  loading,
  className,
}: {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon?: LucideIcon;
  loading?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-5 shadow-xs",
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-gradient-to-br from-primary/30 to-transparent opacity-40 blur-2xl"
      />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-2xl font-semibold leading-tight text-foreground">
              {value}
            </p>
          )}
          {helper ? (
            <p className="text-xs text-muted-foreground">{helper}</p>
          ) : null}
        </div>
        {Icon ? (
          <div className="shrink-0 rounded-lg border bg-background p-2 text-primary">
            <Icon className="size-4" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
