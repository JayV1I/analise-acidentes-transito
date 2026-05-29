import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function InsightBox({
  items,
  title = "Insights automáticos",
}: {
  items: ReactNode[];
  title?: string;
}) {
  return (
    <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue/5 p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-brand-blue-2">
        <span className="inline-block h-2 w-2 rounded-full bg-brand-blue-2" />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-foreground/90"
          >
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-blue-2" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="flex animate-pulse items-center justify-center rounded-xl bg-muted/40"
      style={{ height }}
    >
      <span className="text-xs text-muted-foreground">Carregando dados…</span>
    </div>
  );
}
