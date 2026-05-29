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
import { useFilters } from "@/lib/filters";
import { useQ } from "@/lib/useQuery";
import { ChartCard, ChartSkeleton, InsightBox } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { DarkTooltip } from "@/components/DarkTooltip";
import { COLORS, SERIES, fmt, pct } from "@/lib/format";

export const Route = createFileRoute("/perfil")({
  head: () => ({
    meta: [
      { title: "Perfil dos Acidentes — RodoIntel BI" },
      {
        name: "description",
        content: "Tipos de acidente, pista, condições e severidade.",
      },
    ],
  }),
  component: Perfil,
});

const axis = { fontSize: 11, fill: "#94a3b8" };

function Perfil() {
  const { where } = useFilters();
  const d = [where];

  const tipos = useQ<{ tipo_acidente: string; n: number }>(
    `SELECT tipo_acidente, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY tipo_acidente ORDER BY n DESC`,
    d,
  );
  const pista = useQ<{ tipo_pista: string; n: number }>(
    `SELECT tipo_pista, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY tipo_pista ORDER BY n DESC`,
    d,
  );
  const cond = useQ<{ condicao_metereologica: string; n: number }>(
    `SELECT condicao_metereologica, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY condicao_metereologica ORDER BY n DESC`,
    d,
  );
  const sev = useQ<{ severidade: string; n: number }>(
    `SELECT severidade, COUNT(*) n FROM acidentes ${where} GROUP BY severidade ORDER BY n DESC`,
    d,
  );
  const vit = useQ<{ k: string; n: number }>(
    `SELECT * FROM (
       SELECT 'Mortos' k, SUM(mortos) n FROM acidentes ${where}
       UNION ALL SELECT 'Feridos graves', SUM(feridos_graves) FROM acidentes ${where}
       UNION ALL SELECT 'Feridos leves', SUM(feridos_leves) FROM acidentes ${where}
     ) ORDER BY n DESC`,
    d,
  );
  const total = (tipos.data ?? []).reduce((s, r) => s + r.n, 0);

  const sevColor: Record<string, string> = {
    Fatal: COLORS.red,
    Grave: COLORS.orange,
    Leve: COLORS.blue2,
    "Sem Vítimas": COLORS.green,
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Perfil dos Acidentes"
        description="Características das ocorrências: tipologia, infraestrutura viária, condições e gravidade."
      />

      <ChartCard
        title="Tipos de acidente"
        subtitle="Acidentes únicos · destaque para colisões, atropelamentos, engavetamentos, saídas de pista e tombamentos"
      >
        {!tipos.data ? (
          <ChartSkeleton height={380} />
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(360, tipos.data.length * 26)}>
            <BarChart data={tipos.data} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid horizontal={false} stroke="#1f2c44" />
              <XAxis type="number" tick={axis} stroke="#33415580" />
              <YAxis
                type="category"
                dataKey="tipo_acidente"
                width={170}
                tick={axis}
                stroke="#33415580"
              />
              <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="n" name="Acidentes" radius={[0, 6, 6, 0]}>
                {tipos.data.map((r, i) => {
                  const hot = /frontal|trasei|atropel|engavet|saída|tombamento/i.test(
                    r.tipo_acidente,
                  );
                  return <Cell key={i} fill={hot ? COLORS.orange : COLORS.blue} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Tipo de pista" subtitle="Acidentes únicos">
          {!pista.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie data={pista.data} dataKey="n" nameKey="tipo_pista" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {pista.data.map((_, i) => (
                    <Cell key={i} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Condição meteorológica" subtitle="Acidentes únicos">
          {!cond.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={cond.data} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid horizontal={false} stroke="#1f2c44" />
                <XAxis type="number" tick={axis} stroke="#33415580" />
                <YAxis type="category" dataKey="condicao_metereologica" width={120} tick={axis} stroke="#33415580" />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" fill={COLORS.blue2} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Severidade dos acidentes" subtitle="Registros">
          {!sev.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie data={sev.data} dataKey="n" nameKey="severidade" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {sev.data.map((r, i) => (
                    <Cell key={i} fill={sevColor[r.severidade] ?? SERIES[i % SERIES.length]} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Distribuição de vítimas" subtitle="Total de pessoas">
          {!vit.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={vit.data}>
                <CartesianGrid vertical={false} stroke="#1f2c44" />
                <XAxis dataKey="k" tick={axis} stroke="#33415580" />
                <YAxis tick={axis} stroke="#33415580" />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Vítimas" radius={[6, 6, 0, 0]}>
                  {vit.data.map((_, i) => (
                    <Cell key={i} fill={[COLORS.red, COLORS.orange, COLORS.blue2][i % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {tipos.data?.[0] && (
        <InsightBox
          items={[
            <>
              <b>{tipos.data[0].tipo_acidente}</b> é o tipo de acidente mais
              frequente, representando {pct(total ? (tipos.data[0].n / total) * 100 : 0)} do total.
            </>,
            pista.data?.[0] && (
              <>
                A maioria dos acidentes ocorre em pista{" "}
                <b>{pista.data[0].tipo_pista}</b> ({fmt(pista.data[0].n)}).
              </>
            ),
            cond.data?.[0] && (
              <>
                A condição meteorológica predominante é{" "}
                <b>{cond.data[0].condicao_metereologica}</b>.
              </>
            ),
          ].filter(Boolean)}
        />
      )}
    </div>
  );
}
