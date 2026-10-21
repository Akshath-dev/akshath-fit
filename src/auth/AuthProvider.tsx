import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { createFitnessRepository } from "../lib/supabase-repository";
import type { FitnessRepository } from "../lib/repository";
import { LoginPage } from "./LoginPage";
type State =
  | {
      status:
        "setup-required" | "checking" | "signed-out" | "unauthorized" | "error";
      message?: string;
    }
  | { status: "ready"; userId: string };
const AuthContext = createContext<{
  repository: FitnessRepository;
  userId: string;
  signOut: () => Promise<void>;
} | null>(null);
export function AuthProvider({
  client,
  children,
}: {
  client: SupabaseClient | null;
  children: ReactNode;
}) {
  const generation = useRef(0),
    logoutBarrier = useRef(false);
  const [state, setState] = useState<State>({
      status: client ? "checking" : "setup-required",
    }),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!client) {
      setState({ status: "setup-required" });
      return;
    }
    let mounted = true,
      eventSeen = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let expiryTimer: ReturnType<typeof setTimeout> | undefined;
    function verify(session: Session | null) {
      const mine = ++generation.current;
      if (!mounted) return;
      if (expiryTimer) clearTimeout(expiryTimer);
      if (
        !session ||
        logoutBarrier.current ||
        (session.expires_at && session.expires_at * 1000 <= Date.now())
      ) {
        setState({ status: "signed-out" });
        return;
      }
      if (session.expires_at) {
        expiryTimer = setTimeout(
          () => {
            if (!mounted || mine !== generation.current) return;
            generation.current++;
            setState({ status: "signed-out" });
          },
          Math.min(session.expires_at * 1000 - Date.now(), 2_147_483_647),
        );
      }
      setState((current) =>
        current.status === "ready" && current.userId === session.user.id
          ? current
          : { status: "checking" },
      );
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!mounted || mine !== generation.current) return;
        void (async () => {
          try {
            const { data, error } = await client!.rpc("owner_access");
            if (!mounted || mine !== generation.current) return;
            if (error) throw error;
            if (session.expires_at && session.expires_at * 1000 <= Date.now()) {
              generation.current++;
              setState({ status: "signed-out" });
              return;
            }
            setState(
              data === true
                ? { status: "ready", userId: session.user.id }
                : { status: "unauthorized" },
            );
          } catch (e) {
            if (mounted && mine === generation.current)
              setState({ status: "error", message: (e as Error).message });
          }
        })();
      }, 0);
      timers.add(timer);
    }
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      eventSeen = true;
      verify(session);
    });
    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted || eventSeen) return;
        if (error) setState({ status: "error", message: error.message });
        else verify(data.session);
      })
      .catch((e) => {
        if (mounted && !eventSeen)
          setState({ status: "error", message: e.message });
      });
    return () => {
      mounted = false;
      generation.current++;
      timers.forEach(clearTimeout);
      if (expiryTimer) clearTimeout(expiryTimer);
      data.subscription.unsubscribe();
    };
  }, [client, attempt]);
  async function signOut() {
    logoutBarrier.current = true;
    const mine = ++generation.current;
    setState({ status: "signed-out" });
    if (client) {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) {
        if (mine === generation.current)
          setState({ status: "error", message: error.message });
        throw error;
      }
    }
  }
  async function signIn(email: string, password: string) {
    if (!client) throw new Error("Connect your Supabase project first.");
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    logoutBarrier.current = false;
    setAttempt((x) => x + 1);
  }
  const repository = useMemo(
    () =>
      state.status === "ready" && client
        ? createFitnessRepository(client, state.userId)
        : null,
    [client, state.status, state.status === "ready" ? state.userId : null],
  );
  return (
    <AuthContext.Provider
      value={
        state.status === "ready" && repository
          ? { repository, userId: state.userId, signOut }
          : null
      }
    >
      {state.status === "ready" ? (
        children
      ) : (
        <LoginPage
          status={state.status}
          error={"message" in state ? state.message : undefined}
          onSignIn={signIn}
          onSignOut={signOut}
          onRetry={() => setAttempt((x) => x + 1)}
        />
      )}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("Owner session required.");
  return value;
}
