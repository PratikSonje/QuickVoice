"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/src/components/ui/toggle-group";
import type { DashboardRange } from "@/src/lib/api/resources/dashboard";

const RANGES: { value: DashboardRange; label: string }[] = [
  { value: "24h", label: "24h" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
];

export function RangeSwitcher({ current }: { current: DashboardRange }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function onChange(value: string) {
    if (!value) return;
    const next = new URLSearchParams(params);
    next.set("range", value);
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <ToggleGroup
      type="single"
      size="sm"
      value={current}
      onValueChange={onChange}
      className="rounded-lg border bg-card p-0.5"
    >
      {RANGES.map((r) => (
        <ToggleGroupItem
          key={r.value}
          value={r.value}
          className="rounded-md px-3 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {r.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
