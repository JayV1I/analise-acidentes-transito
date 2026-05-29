import { fmt } from "@/lib/format";

interface TipItem {
  color?: string;
  name?: string | number;
  value?: number | string;
}

export function DarkTooltip(props: {
  active?: boolean;
  payload?: TipItem[];
  label?: string | number;
}) {
  const { active, payload, label } = props;
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover/95 px-3 py-2 shadow-xl backdrop-blur">
      {label != null && (
        <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      )}
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
            style={{ background: p.color }}
          />
          {p.name}:{" "}
          <span className="font-semibold text-foreground">
            {typeof p.value === "number" ? fmt(p.value) : String(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}
