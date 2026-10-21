import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { FitnessRepository } from "../lib/repository";
import type { DashboardSnapshot } from "../lib/types";
import { daysEnding } from "../lib/dates";
type DashboardContextValue = {
  snapshot: DashboardSnapshot | null;
  loading: boolean;
  error: string;
  selectedDate: string;
  refresh: () => Promise<void>;
  mutate: <T>(action: (r: FitnessRepository) => Promise<T>) => Promise<T>;
};
const Context = createContext<DashboardContextValue | null>(null);
export function DashboardProvider({
  repository,
  selectedDate,
  children,
}: {
  repository: FitnessRepository;
  selectedDate: string;
  children: ReactNode;
}) {
  const [loadedDate, setLoadedDate] = useState(""),
    [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const revision = useRef(0),
    alive = useRef(true),
    dateRef = useRef(selectedDate);
  dateRef.current = selectedDate;
  const load = useCallback(
    async (signal?: AbortSignal) => {
      const mine = ++revision.current;
      setLoading(true);
      setError("");
      try {
        const date = dateRef.current;
        const data = await repository.getSnapshot(
          { start: daysEnding(date, 90)[0], end: date },
          signal,
        );
        if (alive.current && mine === revision.current) {
          setSnapshot(data);
          setLoadedDate(date);
        }
      } catch (e) {
        if (alive.current && mine === revision.current && !signal?.aborted)
          setError((e as Error).message);
      } finally {
        if (alive.current && mine === revision.current) setLoading(false);
      }
    },
    [repository],
  );
  useEffect(() => {
    alive.current = true;
    const abort = new AbortController();
    setSnapshot(null);
    void load(abort.signal);
    return () => {
      abort.abort();
      revision.current++;
      alive.current = false;
    };
  }, [selectedDate, load]);
  async function mutate<T>(action: (r: FitnessRepository) => Promise<T>) {
    const saved = await action(repository);
    if (alive.current) await load();
    return saved;
  }
  return (
    <Context.Provider
      value={{
        snapshot: loadedDate === selectedDate ? snapshot : null,
        loading,
        error,
        selectedDate,
        refresh: () => load(),
        mutate,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDashboard() {
  const value = useContext(Context);
  if (!value) throw new Error("Dashboard data provider required.");
  return value;
}
