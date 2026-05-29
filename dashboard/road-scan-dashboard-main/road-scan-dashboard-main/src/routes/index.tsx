import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Database,
  CarFront,
  Users,
  AlertTriangle,
  Activity,
  Route as RouteIcon,
  MapPinned,
  Clock,
} from "lucide-react";
import { useFilters } from "@/lib/filters";
import { useQ } from "@/lib/useQuery";
import { KpiCard } from "@/components/KpiCard";
import { ChartCard, ChartSkeleton, InsightBox } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { DarkTooltip } from "@/components/DarkTooltip";
import { COLORS, SERIES, fmt, pct } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Visão Geral — RodoIntel BI" },
      {
        name: "description",
        content:
          "KPIs executivos e panorama geral dos acidentes rodoviários no Brasil.",
      },
    ],
  }),
  component: Overview,
});

const axis = { fontSize: 11, fill: "#94a3b8" };

function Overview() {
  const { where } = useFilters();
  const d = [where];

  const kpi = useQ<{
    registros: number;
    acidentes: number;
    vitimas: number;
    graves: number;
    mortos: number;
  }>(
    `SELECT COUNT(*) registros, COUNT(DISTINCT id) acidentes,
       SUM(total_vitimas) vitimas,
       COUNT(DISTINCT CASE WHEN acidente_grave=1 THEN id END) graves,
       SUM(mortos) mortos
     FROM acidentes ${where}`,
    d,
  );
  const k = kpi.data?.[0];
  const taxa = k && k.acidentes ? (k.graves / k.acidentes) * 100 : 0;

  const topBR = useQ<{ br: number; n: number }>(
    `SELECT br, COUNT(DISTINCT id) n FROM acidentes ${where} ${
      where ? "AND" : "WHERE"
    } br IS NOT NULL GROUP BY br ORDER BY n DESC LIMIT 1`,
    d,
  );
  const topUF = useQ<{ uf: string; n: number }>(
    `SELECT uf, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY uf ORDER BY n DESC LIMIT 1`,
    d,
  );
  const topFaixa = useQ<{ faixa_horaria: string; n: number }>(
    `SELECT faixa_horaria, COUNT(*) n FROM acidentes ${where} ${
      where ? "AND" : "WHERE"
    } faixa_horaria <> 'Não informado' GROUP BY faixa_horaria ORDER BY n DESC LIMIT 1`,
    d,
  );

  const ufs = useQ<{ uf: string; n: number }>(
    `SELECT uf, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY uf ORDER BY n DESC LIMIT 10`,
    d,
  );
  const brs = useQ<{ br: string; n: number }>(
    `SELECT 'BR-' || CAST(br AS INTEGER) br, COUNT(DISTINCT id) n FROM acidentes ${where} ${
      where ? "AND" : "WHERE"
    } br IS NOT NULL GROUP BY br ORDER BY n DESC LIMIT 15`,
    d,
  );
  const fases = useQ<{ fase_dia: string; n: number }>(
    `SELECT fase_dia, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY fase_dia ORDER BY n DESC`,
    d,
  );
  const gravePie = useQ<{ k: string; n: number }>(
    `SELECT CASE WHEN acidente_grave=1 THEN 'Graves' ELSE 'Não graves' END k,
       COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY 1`,
    d,
  );
  const vitimas = useQ<{ k: string; n: number }>(
    `SELECT * FROM (
       SELECT 'Mortos' k, SUM(mortos) n FROM acidentes ${where}
       UNION ALL SELECT 'Feridos graves', SUM(feridos_graves) FROM acidentes ${where}
       UNION ALL SELECT 'Feridos leves', SUM(feridos_leves) FROM acidentes ${where}
     ) ORDER BY n DESC`,
    d,
  );

  const insights = k
    ? [
        <>
          A base filtrada contém <b>{fmt(k.registros)}</b> registros que
          representam <b>{fmt(k.acidentes)}</b> acidentes únicos e{" "}
          <b>{fmt(k.vitimas)}</b> vítimas envolvidas.
        </>,
        <>
          A taxa de gravidade é de <b>{pct(taxa)}</b>, com{" "}
          <b>{fmt(k.graves)}</b> acidentes graves e <b>{fmt(k.mortos)}</b>{" "}
          óbitos registrados.
        </>,
        topUF.data?.[0] && (
          <>
            A UF <b>{topUF.data[0].uf}</b> concentra o maior número de
            acidentes ({fmt(topUF.data[0].n)}), seguida das demais no ranking.
          </>
        ),
        topBR.data?.[0] && (
          <>
            A rodovia <b>BR-{topBR.data[0].br}</b> é a mais crítica, com{" "}
            <b>{fmt(topBR.data[0].n)}</b> acidentes mapeados.
          </>
        ),
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Visão Geral"
        description="Panorama executivo dos acidentes rodoviários — indicadores recalculados em tempo real conforme os filtros."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Registros Analisados"
          value={fmt(k?.registros)}
          sub="Linhas da base (pessoas)"
          accent="blue"
          icon={<Database className="h-5 w-5" />}
        />
        <KpiCard
          label="Acidentes Únicos"
          value={fmt(k?.acidentes)}
          sub="Identificados por ID"
          accent="blue"
          icon={<CarFront className="h-5 w-5" />}
        />
        <KpiCard
          label="Vítimas Envolvidas"
          value={fmt(k?.vitimas)}
          sub="Feridos + óbitos"
          accent="orange"
          icon={<Users className="h-5 w-5" />}
        />
        <KpiCard
          label="Acidentes Graves"
          value={fmt(k?.graves)}
          sub="Com vítimas graves/fatais"
          accent="red"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
        <KpiCard
          label="Taxa de Gravidade"
          value={pct(taxa)}
          sub="Graves / acidentes"
          accent="red"
          icon={<Activity className="h-5 w-5" />}
        />
        <KpiCard
          label="BR Mais Crítica"
          value={topBR.data?.[0] ? `BR-${topBR.data[0].br}` : "—"}
          sub={topBR.data?.[0] ? `${fmt(topBR.data[0].n)} acidentes` : ""}
          accent="orange"
          icon={<RouteIcon className="h-5 w-5" />}
        />
        <KpiCard
          label="UF Mais Crítica"
          value={topUF.data?.[0]?.uf ?? "—"}
          sub={topUF.data?.[0] ? `${fmt(topUF.data[0].n)} acidentes` : ""}
          accent="green"
          icon={<MapPinned className="h-5 w-5" />}
        />
        <KpiCard
          label="Faixa Horária Crítica"
          value={topFaixa.data?.[0]?.faixa_horaria ?? "—"}
          sub={topFaixa.data?.[0] ? `${fmt(topFaixa.data[0].n)} registros` : ""}
          accent="blue"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Top 10 UFs com mais acidentes" subtitle="Acidentes únicos">
          {!ufs.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={ufs.data} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} stroke="#1f2c44" />
                <XAxis type="number" tick={axis} stroke="#33415580" />
                <YAxis
                  type="category"
                  dataKey="uf"
                  width={36}
                  tick={axis}
                  stroke="#33415580"
                />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" fill={COLORS.blue} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top 15 BRs com mais acidentes" subtitle="Acidentes únicos">
          {!brs.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={brs.data} margin={{ bottom: 30 }}>
                <CartesianGrid vertical={false} stroke="#1f2c44" />
                <XAxis
                  dataKey="br"
                  tick={axis}
                  angle={-45}
                  textAnchor="end"
                  height={50}
                  stroke="#33415580"
                />
                <YAxis tick={axis} stroke="#33415580" />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" fill={COLORS.blue2} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Acidentes por fase do dia" subtitle="Acidentes únicos">
          {!fases.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fases.data}>
                <CartesianGrid vertical={false} stroke="#1f2c44" />
                <XAxis dataKey="fase_dia" tick={axis} stroke="#33415580" />
                <YAxis tick={axis} stroke="#33415580" />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" radius={[6, 6, 0, 0]}>
                  {fases.data.map((_, i) => (
                    <Cell key={i} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChartCard title="Distribuição de acidentes graves">
            {!gravePie.data ? (
              <ChartSkeleton height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={gravePie.data}
                    dataKey="n"
                    nameKey="k"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {gravePie.data.map((row, i) => (
                      <Cell
                        key={i}
                        fill={row.k === "Graves" ? COLORS.red : COLORS.green}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Distribuição de vítimas">
            {!vitimas.data ? (
              <ChartSkeleton height={300} />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vitimas.data}
                    dataKey="n"
                    nameKey="k"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {vitimas.data.map((_, i) => (
                      <Cell
                        key={i}
                        fill={[COLORS.red, COLORS.orange, COLORS.blue2][i % 3]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<DarkTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>

      {insights.length > 0 && <InsightBox items={insights} />}
    </div>
  );
}
