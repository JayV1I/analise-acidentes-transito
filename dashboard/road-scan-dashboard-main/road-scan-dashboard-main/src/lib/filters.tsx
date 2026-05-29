import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface Filters {
  uf: string;
  municipio: string;
  br: string;
  tipo_acidente: string;
  tipo_veiculo: string;
  fase_dia: string;
  condicao_metereologica: string;
  ano: string;
  mes: string;
}

export const EMPTY_FILTERS: Filters = {
  uf: "",
  municipio: "",
  br: "",
  tipo_acidente: "",
  tipo_veiculo: "",
  fase_dia: "",
  condicao_metereologica: "",
  ano: "",
  mes: "",
};

export const FILTER_LABELS: Record<keyof Filters, string> = {
  uf: "UF",
  municipio: "Município",
  br: "BR",
  tipo_acidente: "Tipo de Acidente",
  tipo_veiculo: "Tipo de Veículo",
  fase_dia: "Fase do Dia",
  condicao_metereologica: "Condição Meteorológica",
  ano: "Ano",
  mes: "Mês",
};

function esc(v: string) {
  return v.replace(/'/g, "''");
}

export function buildWhere(f: Filters): string {
  const clauses: string[] = [];
  if (f.uf) clauses.push(`uf = '${esc(f.uf)}'`);
  if (f.municipio) clauses.push(`municipio = '${esc(f.municipio)}'`);
  if (f.br) clauses.push(`br = ${Number(f.br)}`);
  if (f.tipo_acidente) clauses.push(`tipo_acidente = '${esc(f.tipo_acidente)}'`);
  if (f.tipo_veiculo) clauses.push(`tipo_veiculo = '${esc(f.tipo_veiculo)}'`);
  if (f.fase_dia) clauses.push(`fase_dia = '${esc(f.fase_dia)}'`);
  if (f.condicao_metereologica)
    clauses.push(`condicao_metereologica = '${esc(f.condicao_metereologica)}'`);
  if (f.ano) clauses.push(`ano = ${Number(f.ano)}`);
  if (f.mes) clauses.push(`mes = ${Number(f.mes)}`);
  return clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
}

interface FilterCtx {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string) => void;
  reset: () => void;
  where: string;
  activeCount: number;
}

const Ctx = createContext<FilterCtx | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const value = useMemo<FilterCtx>(() => {
    const setFilter = (key: keyof Filters, v: string) =>
      setFilters((prev) => ({ ...prev, [key]: v }));
    const reset = () => setFilters(EMPTY_FILTERS);
    const where = buildWhere(filters);
    const activeCount = Object.values(filters).filter(Boolean).length;
    return { filters, setFilter, reset, where, activeCount };
  }, [filters]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useFilters() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFilters must be used within FilterProvider");
  return ctx;
}
