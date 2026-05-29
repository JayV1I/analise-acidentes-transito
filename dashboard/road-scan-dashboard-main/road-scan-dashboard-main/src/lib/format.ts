export const COLORS = {
  blue: "#2563eb",
  blue2: "#60a5fa",
  green: "#22c55e",
  orange: "#f97316",
  red: "#dc2626",
  slate: "#94a3b8",
};

export const SERIES = [
  "#2563eb",
  "#60a5fa",
  "#22c55e",
  "#f97316",
  "#dc2626",
  "#a78bfa",
  "#14b8a6",
  "#eab308",
];

const nf = new Intl.NumberFormat("pt-BR");
const nf1 = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const fmt = (n: number | null | undefined) =>
  n == null ? "—" : nf.format(Math.round(n));

export const fmtDec = (n: number | null | undefined) =>
  n == null ? "—" : nf1.format(n);

export const pct = (n: number | null | undefined) =>
  n == null ? "—" : `${nf1.format(n)}%`;

export const MESES = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const DIAS_SEMANA = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];
