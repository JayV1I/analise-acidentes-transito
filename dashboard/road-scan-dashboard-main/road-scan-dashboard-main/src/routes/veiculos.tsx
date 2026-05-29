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
import { useFilters } from "@/lib/filters";
import { useQ } from "@/lib/useQuery";
import { ChartCard, ChartSkeleton, InsightBox } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { DarkTooltip } from "@/components/DarkTooltip";
import { COLORS, fmt, pct } from "@/lib/format";

export const Route = createFileRoute("/veiculos")({
  head: () => ({
    meta: [
      { title: "Veículos — RodoIntel BI" },
      {
        name: "description",
        content: "Veículos mais envolvidos e índice de risco por tipo.",
      },
    ],
  }),
  component: Veiculos,
});

const axis = { fontSize: 11, fill: "#94a3b8" };

interface VRow {
  tipo_veiculo: string;
  n: number;
  graves: number;
}

function Veiculos() {
  const { where } = useFilters();
  const d = [where];

  const veic = useQ<VRow>(
    `SELECT tipo_veiculo, COUNT(*) n,
       SUM(CASE WHEN acidente_grave=1 THEN 1 ELSE 0 END) graves
     FROM acidentes ${where} ${where ? "AND" : "WHERE"} tipo_veiculo IS NOT NULL
     GROUP BY tipo_veiculo ORDER BY n DESC LIMIT 15`,
    d,
  );
  const totalAll = useQ<{ t: number }>(
    `SELECT COUNT(*) t FROM acidentes ${where} ${where ? "AND" : "WHERE"} tipo_veiculo IS NOT NULL`,
    d,
  );
  const total = totalAll.data?.[0]?.t ?? 0;

  const rows = (veic.data ?? []).map((r) => ({
    ...r,
    part: total ? (r.n / total) * 100 : 0,
    taxaGrave: r.n ? (r.graves / r.n) * 100 : 0,
  }));
  const risco = [...rows]
    .map((r) => ({ ...r, risco: r.taxaGrave * Math.log10(r.n + 10) }))
    .sort((a, b) => b.risco - a.risco);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Veículos"
        description="Exposição ao risco por tipo de veículo — frequência de envolvimento e severidade das ocorrências."
      />

      <ChartCard
        title="Top 15 veículos mais envolvidos"
        subtitle="Quantidade de envolvimentos e participação percentual"
      >
        {!veic.data ? (
          <ChartSkeleton height={420} />
        ) : (
          <ResponsiveContainer width="100%" height={440}>
            <BarChart data={rows} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} stroke="#1f2c44" />
              <XAxis type="number" tick={axis} stroke="#33415580" />
              <YAxis type="category" dataKey="tipo_veiculo" width={150} tick={axis} stroke="#33415580" />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="n" name="Envolvimentos" fill={COLORS.blue} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard
        title="Índice de risco por veículo"
        subtitle="Combinação de frequência e taxa de acidentes graves"
      >
        {!veic.data ? (
          <ChartSkeleton height={320} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Veículo</th>
                  <th className="px-3 py-2 text-right">Acidentes</th>
                  <th className="px-3 py-2 text-right">Participação</th>
                  <th className="px-3 py-2 text-right">% Graves</th>
                </tr>
              </thead>
              <tbody>
                {risco.map((r, i) => (
                  <tr key={r.tipo_veiculo} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="px-3 py-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-orange/15 text-xs font-semibold text-brand-orange">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-foreground">{r.tipo_veiculo}</td>
                    <td className="px-3 py-2 text-right font-medium text-foreground">{fmt(r.n)}</td>
                    <td className="px-3 py-2 text-right text-muted-foreground">{pct(r.part)}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-semibold text-brand-red">{pct(r.taxaGrave)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      <ChartCard title="% de acidentes graves por veículo" subtitle="Severidade relativa">
        {!veic.data ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={[...rows].sort((a, b) => b.taxaGrave - a.taxaGrave)} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} stroke="#1f2c44" />
              <XAxis type="number" tick={axis} stroke="#33415580" unit="%" />
              <YAxis type="category" dataKey="tipo_veiculo" width={150} tick={axis} stroke="#33415580" />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="taxaGrave" name="% Graves" radius={[0, 6, 6, 0]}>
                {rows.map((_, i) => (
                  <Cell key={i} fill={COLORS.red} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {risco[0] && (
        <InsightBox
          title="Insights sobre exposição ao risco"
          items={[
            <>
              <b>{rows[0]?.tipo_veiculo}</b> é o veículo mais envolvido em
              acidentes ({fmt(rows[0]?.n)} ocorrências,{" "}
              {pct(rows[0]?.part)} do total).
            </>,
            <>
              <b>{risco[0].tipo_veiculo}</b> apresenta o maior índice de risco,
              combinando volume e alta taxa de gravidade ({pct(risco[0].taxaGrave)}).
            </>,
            <>
              Veículos de duas rodas e de carga tendem a apresentar maior
              severidade relativa nas ocorrências analisadas.
            </>,
          ]}
        />
      )}
    </div>
  );
}
