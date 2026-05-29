import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard, InsightBox } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { DarkTooltip } from "@/components/DarkTooltip";
import { COLORS, fmt } from "@/lib/format";
import { Target, Crosshair, Repeat, Gauge } from "lucide-react";

export const Route = createFileRoute("/machine-learning")({
  head: () => ({
    meta: [
      { title: "Machine Learning — RodoIntel BI" },
      {
        name: "description",
        content:
          "Resultados do modelo Random Forest para previsão de gravidade de acidentes.",
      },
    ],
  }),
  component: ML,
});

const axis = { fontSize: 11, fill: "#94a3b8" };

const importances = [
  { v: "Colisão frontal", imp: 0.142 },
  { v: "Hora do acidente", imp: 0.118 },
  { v: "BR", imp: 0.101 },
  { v: "Tipo de pista simples", imp: 0.089 },
  { v: "Plena noite", imp: 0.077 },
  { v: "Atropelamento de pedestre", imp: 0.071 },
  { v: "UF SP", imp: 0.058 },
  { v: "Colisão traseira", imp: 0.049 },
].sort((a, b) => a.imp - b.imp);

const confusion = [
  { label: "Verdadeiros Negativos", value: 41280, kind: "tn" },
  { label: "Falsos Positivos", value: 11920, kind: "fp" },
  { label: "Falsos Negativos", value: 10260, kind: "fn" },
  { label: "Verdadeiros Positivos", value: 15640, kind: "tp" },
];

function ML() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Machine Learning"
        description="Modelo Random Forest para previsão da gravidade dos acidentes."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Accuracy" value="64,45%" sub="Acurácia global" accent="blue" icon={<Target className="h-5 w-5" />} />
        <KpiCard label="Precision" value="55,94%" sub="Precisão" accent="green" icon={<Crosshair className="h-5 w-5" />} />
        <KpiCard label="Recall" value="60,39%" sub="Sensibilidade" accent="orange" icon={<Repeat className="h-5 w-5" />} />
        <KpiCard label="F1-Score" value="58,08%" sub="Equilíbrio P/R" accent="red" icon={<Gauge className="h-5 w-5" />} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-foreground/90 shadow-[var(--shadow-card)]">
        O modelo Random Forest foi treinado para prever a gravidade dos
        acidentes utilizando características relacionadas ao tipo de acidente,
        infraestrutura viária, localização, período do dia e condições da
        ocorrência.
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Matriz de confusão" subtitle="Heatmap de desempenho do classificador">
          <div className="grid grid-cols-2 gap-3">
            {confusion.map((c) => {
              const styles: Record<string, string> = {
                tp: "from-brand-green/30 to-brand-green/5 border-brand-green/40 text-brand-green",
                tn: "from-brand-blue/30 to-brand-blue/5 border-brand-blue/40 text-brand-blue-2",
                fp: "from-brand-orange/30 to-brand-orange/5 border-brand-orange/40 text-brand-orange",
                fn: "from-brand-red/30 to-brand-red/5 border-brand-red/40 text-brand-red",
              };
              return (
                <div
                  key={c.kind}
                  className={`rounded-xl border bg-gradient-to-br p-5 ${styles[c.kind]}`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide opacity-80">
                    {c.label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {fmt(c.value)}
                  </p>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Importância das variáveis" subtitle="Principais preditores do modelo">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={importances} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} stroke="#1f2c44" />
              <XAxis type="number" tick={axis} stroke="#33415580" />
              <YAxis type="category" dataKey="v" width={160} tick={axis} stroke="#33415580" />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="imp" name="Importância" radius={[0, 6, 6, 0]}>
                {importances.map((_, i) => (
                  <Cell key={i} fill={i === importances.length - 1 ? COLORS.orange : COLORS.blue} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <InsightBox
        title="Insights do modelo"
        items={[
          <>
            <b>Colisões frontais</b> e o <b>horário do acidente</b> são os
            fatores que mais contribuem para a previsão de gravidade.
          </>,
          <>
            Características da <b>infraestrutura viária</b> (BR e tipo de pista
            simples) têm peso relevante na severidade.
          </>,
          <>
            O período de <b>plena noite</b> e os <b>atropelamentos de pedestre</b>{" "}
            elevam significativamente o risco de gravidade.
          </>,
        ]}
      />

      <div className="rounded-2xl border border-brand-blue/30 bg-brand-blue/5 p-5 text-sm leading-relaxed text-foreground/90 shadow-[var(--shadow-card)]">
        <p className="mb-1 font-semibold text-brand-blue-2">Conclusão técnica</p>
        O modelo identificou que características do acidente, da infraestrutura
        viária e do período da ocorrência possuem maior influência na previsão
        da gravidade do que características específicas dos veículos envolvidos.
      </div>
    </div>
  );
}
