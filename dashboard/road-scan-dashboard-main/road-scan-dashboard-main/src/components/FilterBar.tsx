import { useFilters, FILTER_LABELS, type Filters } from "@/lib/filters";
import { useQ } from "@/lib/useQuery";
import { MESES } from "@/lib/format";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

function useOptions(col: string, where = "", numeric = false) {
  const sql = `SELECT DISTINCT ${col} AS v FROM acidentes ${where} ${
    where ? "AND" : "WHERE"
  } ${col} IS NOT NULL ORDER BY ${col}`;
  const { data } = useQ<{ v: string | number }>(sql, [sql]);
  return (data ?? []).map((r) => r.v);
}

function Select({
  field,
  options,
  format,
}: {
  field: keyof Filters;
  options: (string | number)[];
  format?: (v: string | number) => string;
}) {
  const { filters, setFilter } = useFilters();
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {FILTER_LABELS[field]}
      </span>
      <select
        value={filters[field]}
        onChange={(e) => setFilter(field, e.target.value)}
        className="h-9 w-full min-w-[120px] rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus:border-brand-blue"
      >
        <option value="">Todos</option>
        {options.map((o) => (
          <option key={String(o)} value={String(o)}>
            {format ? format(o) : String(o)}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar() {
  const { filters, reset, activeCount } = useFilters();

  const ufs = useOptions("uf");
  const muniWhere = filters.uf ? `WHERE uf = '${filters.uf.replace(/'/g, "''")}'` : "";
  const munis = useOptions("municipio", muniWhere);
  const brs = useOptions("br");
  const tiposAcc = useOptions("tipo_acidente");
  const tiposVeic = useOptions("tipo_veiculo");
  const fases = useOptions("fase_dia");
  const condicoes = useOptions("condicao_metereologica");
  const anos = useOptions("ano");
  const meses = useOptions("mes");

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <SlidersHorizontal className="h-4 w-4 text-brand-blue-2" />
          Filtros Globais
          {activeCount > 0 && (
            <span className="rounded-full bg-brand-blue/20 px-2 py-0.5 text-[11px] font-medium text-brand-blue-2">
              {activeCount} ativo{activeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand-blue/40 hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Limpar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        <Select field="uf" options={ufs} />
        <Select field="municipio" options={munis} />
        <Select field="br" options={brs} format={(v) => `BR-${Number(v)}`} />
        <Select field="tipo_acidente" options={tiposAcc} />
        <Select field="tipo_veiculo" options={tiposVeic} />
        <Select field="fase_dia" options={fases} />
        <Select field="condicao_metereologica" options={condicoes} />
        <Select field="ano" options={anos} />
        <Select
          field="mes"
          options={meses}
          format={(v) => MESES[Number(v) - 1] ?? String(v)}
        />
      </div>
    </div>
  );
}
