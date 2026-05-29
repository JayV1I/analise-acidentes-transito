import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { useFilters } from "@/lib/filters";
import { useQ } from "@/lib/useQuery";
import { ChartCard, ChartSkeleton, InsightBox } from "@/components/ChartCard";
import { PageHeader } from "@/components/PageHeader";
import { fmt } from "@/lib/format";
import type { MapPoint } from "@/components/MapView";

export const Route = createFileRoute("/geografia")({
  head: () => ({
    meta: [
      { title: "Análise Geográfica — RodoIntel BI" },
      {
        name: "description",
        content: "Mapa interativo e rankings geográficos de acidentes.",
      },
    ],
  }),
  component: Geo,
});

function RankTable({
  title,
  rows,
  labelKey,
  loading,
  prefix = "",
}: {
  title: string;
  rows: { label: string | number; n: number }[];
  labelKey: string;
  loading: boolean;
  prefix?: string;
}) {
  return (
    <ChartCard title={title} subtitle={labelKey}>
      {loading ? (
        <ChartSkeleton height={260} />
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-muted/40"
            >
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-blue/15 text-xs font-semibold text-brand-blue-2">
                  {i + 1}
                </span>
                <span className="text-foreground">
                  {prefix}
                  {r.label}
                </span>
              </span>
              <span className="font-semibold text-foreground">{fmt(r.n)}</span>
            </li>
          ))}
        </ul>
      )}
    </ChartCard>
  );
}

function Geo() {
  const { where } = useFilters();
  const d = [where];
  const [Map, setMap] = useState<ComponentType<{ points: MapPoint[] }> | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    import("@/components/MapView").then((m) => {
      if (active) setMap(() => m.default);
    });
    return () => {
      active = false;
    };
  }, []);

  const pts = useQ<MapPoint>(
    `SELECT any_value(municipio) municipio, any_value(uf) uf,
       any_value(br) br, any_value(km) km, any_value(tipo_acidente) tipo,
       any_value(severidade) sev, MAX(latitude) lat, MAX(longitude) lng,
       SUM(total_vitimas) vitimas, MAX(acidente_grave) grave
     FROM acidentes ${where} ${where ? "AND" : "WHERE"}
       latitude IS NOT NULL AND longitude IS NOT NULL
       AND latitude BETWEEN -34 AND 6 AND longitude BETWEEN -74 AND -33
     GROUP BY id`,
    d,
  );

  const ufs = useQ<{ label: string; n: number }>(
    `SELECT uf label, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY uf ORDER BY n DESC LIMIT 10`,
    d,
  );
  const brs = useQ<{ label: number; n: number }>(
    `SELECT CAST(br AS INTEGER) label, COUNT(DISTINCT id) n FROM acidentes ${where} ${
      where ? "AND" : "WHERE"
    } br IS NOT NULL GROUP BY br ORDER BY n DESC LIMIT 10`,
    d,
  );
  const munis = useQ<{ label: string; n: number }>(
    `SELECT municipio label, COUNT(DISTINCT id) n FROM acidentes ${where} GROUP BY municipio ORDER BY n DESC LIMIT 10`,
    d,
  );
  const munisG = useQ<{ label: string; n: number }>(
    `SELECT municipio label, COUNT(DISTINCT CASE WHEN acidente_grave=1 THEN id END) n
     FROM acidentes ${where} GROUP BY municipio ORDER BY n DESC LIMIT 10`,
    d,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Análise Geográfica"
        description="Distribuição espacial dos acidentes com clusterização inteligente e rankings por UF, BR e município."
      />

      <ChartCard
        title="Mapa de acidentes"
        subtitle={`${fmt(pts.data?.length)} acidentes georreferenciados · vermelho = grave`}
      >
        {Map && pts.data ? (
          <Map points={pts.data} />
        ) : (
          <ChartSkeleton height={520} />
        )}
      </ChartCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <RankTable
          title="Ranking de UFs"
          labelKey="Acidentes únicos"
          rows={ufs.data ?? []}
          loading={!ufs.data}
        />
        <RankTable
          title="Ranking de BRs"
          labelKey="Acidentes únicos"
          rows={brs.data ?? []}
          loading={!brs.data}
          prefix="BR-"
        />
        <RankTable
          title="Municípios — concentração"
          labelKey="Acidentes únicos"
          rows={munis.data ?? []}
          loading={!munis.data}
        />
        <RankTable
          title="Municípios — acidentes graves"
          labelKey="Acidentes graves"
          rows={munisG.data ?? []}
          loading={!munisG.data}
        />
      </div>

      {ufs.data?.[0] && munis.data?.[0] && (
        <InsightBox
          items={[
            <>
              <b>{ufs.data[0].label}</b> lidera em volume de acidentes (
              {fmt(ufs.data[0].n)}).
            </>,
            <>
              O município de <b>{munis.data[0].label}</b> apresenta a maior
              concentração de acidentes ({fmt(munis.data[0].n)}).
            </>,
            munisG.data?.[0] && (
              <>
                <b>{munisG.data[0].label}</b> destaca-se pela concentração de
                acidentes graves ({fmt(munisG.data[0].n)}).
              </>
            ),
          ].filter(Boolean)}
        />
      )}
    </div>
  );
}
