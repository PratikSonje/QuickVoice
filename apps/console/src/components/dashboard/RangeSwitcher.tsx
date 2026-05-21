"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
      className="border bg-background p-1"
    >
      {RANGES.map((range) => (
        <ToggleGroupItem
          key={range.value}
          value={range.value}
          className="h-8 px-3 text-xs font-semibold text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
        >
          {range.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
