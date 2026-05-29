import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  MapPin,
  Clock,
  ClipboardList,
  Car,
  BrainCircuit,
  Lightbulb,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/geografia", label: "Análise Geográfica", icon: MapPin },
  { to: "/temporal", label: "Análise Temporal", icon: Clock },
  { to: "/perfil", label: "Perfil dos Acidentes", icon: ClipboardList },
  { to: "/veiculos", label: "Veículos", icon: Car },
  { to: "/machine-learning", label: "Machine Learning", icon: BrainCircuit },
  { to: "/conclusoes", label: "Conclusões", icon: Lightbulb },
] as const;

export function Sidebar() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/15 text-brand-blue-2">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">
            RodoIntel BI
          </p>
          <p className="text-[11px] text-muted-foreground">
            Acidentes Rodoviários
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV.map((item) => {
          const active = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-blue text-primary-foreground shadow-[var(--shadow-card)]"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          312.084 registros · Base PRF 2025
        </p>
      </div>
    </aside>
  );
}
