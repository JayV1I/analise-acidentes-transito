import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  accent?: "blue" | "green" | "orange" | "red" | "slate";
}

const accentMap: Record<string, string> = {
  blue: "text-brand-blue-2 bg-brand-blue/15",
  green: "text-brand-green bg-brand-green/15",
  orange: "text-brand-orange bg-brand-orange/15",
  red: "text-brand-red bg-brand-red/15",
  slate: "text-muted-foreground bg-muted",
};

export function KpiCard({
  label,
  value,
  sub,
  icon,
  accent = "blue",
}: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 truncate text-2xl font-semibold text-foreground">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              accentMap[accent],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
