import type * as duckdb from "@duckdb/duckdb-wasm";

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;
let connPromise: Promise<duckdb.AsyncDuckDBConnection> | null = null;

async function initDB(): Promise<duckdb.AsyncDuckDB> {
  const duckdb = await import("@duckdb/duckdb-wasm");
  const bundles = duckdb.getJsDelivrBundles();
  const bundle = await duckdb.selectBundle(bundles);
  const workerUrl = URL.createObjectURL(
    new Blob([`importScripts("${bundle.mainWorker}");`], {
      type: "text/javascript",
    }),
  );
  const worker = new Worker(workerUrl);
  const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
  const db = new duckdb.AsyncDuckDB(logger, worker);
  await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
  URL.revokeObjectURL(workerUrl);
  return db;
}

export async function getConnection(): Promise<duckdb.AsyncDuckDBConnection> {
  if (typeof window === "undefined") {
    throw new Error("DuckDB is only available in the browser");
  }
  if (!connPromise) {
    connPromise = (async () => {
      if (!dbPromise) dbPromise = initDB();
      const db = await dbPromise;
      const res = await fetch("/data/acidentes.parquet");
      const buf = new Uint8Array(await res.arrayBuffer());
      await db.registerFileBuffer("acidentes.parquet", buf);
      const conn = await db.connect();
      await conn.query(
        `CREATE VIEW acidentes AS SELECT * FROM read_parquet('acidentes.parquet');`,
      );
      return conn;
    })();
  }
  return connPromise;
}

function normalizeRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  for (const k in row) {
    const v = row[k];
    out[k] = typeof v === "bigint" ? Number(v) : v;
  }
  return out;
}

export async function runQuery<T = Record<string, unknown>>(
  sql: string,
): Promise<T[]> {
  const conn = await getConnection();
  const result = await conn.query(sql);
  return result.toArray().map((r) => normalizeRow(r.toJSON()) as T);
}
