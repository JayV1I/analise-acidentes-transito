import { createFileRoute } from "@tanstack/react-router";
import {
  Flame,
  GitFork,
  Moon,
  Bike,
  Route as RouteIcon,
  MapPinned,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useFilters } from "@/lib/filters";
import { useQ } from "@/lib/useQuery";
import { fmt } from "@/lib/format";

export const Route = createFileRoute("/conclusoes")({
  head: () => ({
    meta: [
      { title: "Conclusões — RodoIntel BI" },
      {
        name: "description",
        content: "Principais achados executivos da análise de acidentes.",
      },
    ],
  }),
  component: Conclusoes,
});

const CARDS = [
  {
    icon: Flame,
    accent: "text-brand-red bg-brand-red/15",
    title: "Colisões frontais",
    text: "Apresentam o maior impacto na gravidade dos acidentes e na geração de vítimas fatais.",
  },
  {
    icon: GitFork,
    accent: "text-brand-orange bg-brand-orange/15",
    title: "Pista simples",
    text: "Acidentes em pista simples concentram maior risco e severidade relativa.",
  },
  {
    icon: Moon,
    accent: "text-brand-blue-2 bg-brand-blue/15",
    title: "Períodos noturnos",
    text: "A plena noite concentra os acidentes mais severos, exigindo atenção redobrada.",
  },
  {
    icon: Bike,
    accent: "text-brand-green bg-brand-green/15",
    title: "Motocicletas",
    text: "Apresentam elevada exposição ao risco e alta taxa de vítimas graves.",
  },
  {
    icon: RouteIcon,
    accent: "text-brand-orange bg-brand-orange/15",
    title: "Rodovias críticas",
    text: "Algumas BRs concentram parcela significativa das ocorrências do país.",
  },
  {
    icon: MapPinned,
    accent: "text-brand-blue-2 bg-brand-blue/15",
    title: "Regiões recorrentes",
    text: "Certas regiões apresentam padrões recorrentes de acidentes graves.",
  },
];

function Conclusoes() {
  const { where } = useFilters();
  const k = useQ<{ registros: number; acidentes: number; vitimas: number }>(
    `SELECT COUNT(*) registros, COUNT(DISTINCT id) acidentes, SUM(total_vitimas) vitimas FROM acidentes ${where}`,
    [where],
  ).data?.[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Conclusões"
        description="Síntese executiva dos principais achados para subsidiar a tomada de decisão."
      />

      {k && (
        <div className="rounded-2xl border border-border bg-card p-5 text-sm text-foreground/90 shadow-[var(--shadow-card)]">
          A análise considerou <b>{fmt(k.registros)}</b> registros,{" "}
          <b>{fmt(k.acidentes)}</b> acidentes únicos e <b>{fmt(k.vitimas)}</b>{" "}
          vítimas envolvidas (conforme filtros aplicados).
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand-blue/40"
            >
              <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${c.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {c.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
