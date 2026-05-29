import { useEffect, useState } from "react";
import { runQuery } from "./duckdb";

interface QueryState<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
}

export function useQ<T = Record<string, unknown>>(
  sql: string,
  deps: unknown[] = [],
): QueryState<T> {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    runQuery<T>(sql)
      .then((data) => {
        if (active) setState({ data, loading: false, error: null });
      })
      .catch((e) => {
        if (active)
          setState({ data: null, loading: false, error: String(e) });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
