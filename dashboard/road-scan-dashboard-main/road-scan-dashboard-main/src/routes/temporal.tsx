import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useFilters } from "@/lib/filters";
import { useQ } from "@/lib/useQuery";
import { ChartCard, ChartSkeleton, InsightBox } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { DarkTooltip } from "@/components/DarkTooltip";
import { COLORS, SERIES, MESES, DIAS_SEMANA, fmt } from "@/lib/format";
import { Clock, CalendarDays, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/temporal")({
  head: () => ({
    meta: [
      { title: "Análise Temporal — RodoIntel BI" },
      {
        name: "description",
        content: "Padrões temporais de acidentes por hora, dia e mês.",
      },
    ],
  }),
  component: Temporal,
});

const axis = { fontSize: 11, fill: "#94a3b8" };

function Temporal() {
  const { where } = useFilters();
  const d = [where];

  const hora = useQ<{ hora: number; n: number }>(
    `SELECT hora, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY hora ORDER BY hora`,
    d,
  );
  const dow = useQ<{ dia_semana_num: number; n: number }>(
    `SELECT dia_semana_num, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY dia_semana_num ORDER BY dia_semana_num`,
    d,
  );
  const mes = useQ<{ mes: number; n: number }>(
    `SELECT mes, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY mes ORDER BY mes`,
    d,
  );
  const fds = useQ<{ k: string; n: number }>(
    `SELECT CASE WHEN fim_de_semana THEN 'Fim de semana' ELSE 'Dias úteis' END k,
       COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY 1 ORDER BY n DESC`,
    d,
  );
  const fase = useQ<{ fase_dia: string; n: number }>(
    `SELECT fase_dia, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY fase_dia ORDER BY n DESC`,
    d,
  );
  const topHora = useQ<{ hora: number; n: number }>(
    `SELECT hora, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY hora ORDER BY n DESC LIMIT 1`,
    d,
  );
  const topDow = useQ<{ dia_semana_num: number; n: number }>(
    `SELECT dia_semana_num, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY dia_semana_num ORDER BY n DESC LIMIT 1`,
    d,
  );
  const faseGrave = useQ<{ fase_dia: string; n: number }>(
    `SELECT fase_dia, COUNT(DISTINCT CASE WHEN acidente_grave=1 THEN id END) n
     FROM acidentes ${where} GROUP BY fase_dia ORDER BY n DESC LIMIT 1`,
    d,
  );

  const horaData = (hora.data ?? []).map((r) => ({
    label: `${String(r.hora).padStart(2, "0")}h`,
    n: r.n,
  }));
  const dowData = (dow.data ?? []).map((r) => ({
    label: DIAS_SEMANA[r.dia_semana_num] ?? String(r.dia_semana_num),
    n: r.n,
  }));
  const mesData = (mes.data ?? []).map((r) => ({
    label: MESES[r.mes - 1] ?? String(r.mes),
    n: r.n,
  }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Análise Temporal"
        description="Distribuição dos acidentes ao longo das horas, dias e meses — identificação de períodos críticos."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          label="Horário Mais Crítico"
          value={topHora.data?.[0] ? `${topHora.data[0].hora}h` : "—"}
          sub={topHora.data?.[0] ? `${fmt(topHora.data[0].n)} acidentes` : ""}
          accent="red"
          icon={<Clock className="h-5 w-5" />}
        />
        <KpiCard
          label="Dia Mais Crítico"
          value={
            topDow.data?.[0]
              ? (DIAS_SEMANA[topDow.data[0].dia_semana_num] ?? "—")
              : "—"
          }
          sub={topDow.data?.[0] ? `${fmt(topDow.data[0].n)} acidentes` : ""}
          accent="orange"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <KpiCard
          label="Fase + Acidentes Graves"
          value={faseGrave.data?.[0]?.fase_dia ?? "—"}
          sub={faseGrave.data?.[0] ? `${fmt(faseGrave.data[0].n)} graves` : ""}
          accent="red"
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <ChartCard title="Acidentes por hora do dia" subtitle="Acidentes únicos">
        {!hora.data ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={horaData}>
              <CartesianGrid vertical={false} stroke="#1f2c44" />
              <XAxis dataKey="label" tick={axis} stroke="#33415580" interval={1} />
              <YAxis tick={axis} stroke="#33415580" />
              <Tooltip content={<DarkTooltip />} />
              <Line
                type="monotone"
                dataKey="n"
                name="Acidentes"
                stroke={COLORS.blue2}
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Acidentes por dia da semana" subtitle="Acidentes únicos">
          {!dow.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={dowData}>
                <CartesianGrid vertical={false} stroke="#1f2c44" />
                <XAxis dataKey="label" tick={axis} stroke="#33415580" />
                <YAxis tick={axis} stroke="#33415580" />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" fill={COLORS.blue} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Acidentes por mês" subtitle="Acidentes únicos">
          {!mes.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={mesData}>
                <CartesianGrid vertical={false} stroke="#1f2c44" />
                <XAxis dataKey="label" tick={axis} stroke="#33415580" />
                <YAxis tick={axis} stroke="#33415580" />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" fill={COLORS.green} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Dias úteis x Fim de semana" subtitle="Acidentes únicos">
          {!fds.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={fds.data}>
                <CartesianGrid vertical={false} stroke="#1f2c44" />
                <XAxis dataKey="k" tick={axis} stroke="#33415580" />
                <YAxis tick={axis} stroke="#33415580" />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" radius={[6, 6, 0, 0]}>
                  {fds.data.map((_, i) => (
                    <Cell key={i} fill={[COLORS.blue, COLORS.orange][i % 2]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Distribuição por fase do dia" subtitle="Acidentes únicos">
          {!fase.data ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={fase.data} layout="vertical">
                <CartesianGrid horizontal={false} stroke="#1f2c44" />
                <XAxis type="number" tick={axis} stroke="#33415580" />
                <YAxis
                  type="category"
                  dataKey="fase_dia"
                  width={90}
                  tick={axis}
                  stroke="#33415580"
                />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: "#ffffff08" }} />
                <Bar dataKey="n" name="Acidentes" radius={[0, 6, 6, 0]}>
                  {fase.data.map((_, i) => (
                    <Cell key={i} fill={SERIES[i % SERIES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {topHora.data?.[0] && topDow.data?.[0] && (
        <InsightBox
          items={[
            <>
              O horário mais crítico é por volta das{" "}
              <b>{topHora.data[0].hora}h</b>, com {fmt(topHora.data[0].n)}{" "}
              acidentes.
            </>,
            <>
              <b>{DIAS_SEMANA[topDow.data[0].dia_semana_num]}</b> é o dia da
              semana com maior número de ocorrências.
            </>,
            faseGrave.data?.[0] && (
              <>
                A fase <b>{faseGrave.data[0].fase_dia}</b> concentra a maior
                quantidade de acidentes graves.
              </>
            ),
          ].filter(Boolean)}
        />
      )}
    </div>
  );
}
