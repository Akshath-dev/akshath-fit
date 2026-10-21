import { it, expect, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AuthProvider, useAuth } from "./AuthProvider";
function fake(allowed: Promise<unknown> | boolean = true) {
  let approval = allowed;
  let emit: (event: string, session: unknown) => void = () => {};
  const client = {
    auth: {
      getSession: async () => ({
        data: { session: { user: { id: "owner" } } },
        error: null,
      }),
      onAuthStateChange: (fn: typeof emit) => {
        emit = fn;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      signInWithPassword: async () => ({
        error: { message: "Invalid login credentials" },
      }),
      signOut: async () => {
        emit("SIGNED_OUT", null);
        return { error: null };
      },
    },
    rpc: () =>
      typeof approval === "boolean"
        ? Promise.resolve({ data: approval, error: null })
        : approval,
  };
  return {
    client: client as unknown as SupabaseClient,
    setApproval: (value: Promise<unknown> | boolean) => {
      approval = value;
    },
    emit: (session: unknown) =>
      emit(session ? "SIGNED_IN" : "SIGNED_OUT", session),
  };
}
it("does not mount private content when configuration is missing", () => {
  render(
    <AuthProvider client={null}>
      <p>Private records</p>
    </AuthProvider>,
  );
  expect(screen.queryByText("Private records")).not.toBeInTheDocument();
  expect(screen.getByText(/Connect your Supabase/)).toBeInTheDocument();
});
it("denies an authenticated non-owner", async () => {
  const f = fake(false);
  render(
    <AuthProvider client={f.client}>
      <p>Private records</p>
    </AuthProvider>,
  );
  await screen.findByText(/not authorized/i);
  expect(screen.queryByText("Private records")).not.toBeInTheDocument();
});
it("purges owner content on sign-out", async () => {
  const f = fake();
  render(
    <AuthProvider client={f.client}>
      <p>Private records</p>
    </AuthProvider>,
  );
  await screen.findByText("Private records");
  act(() => f.emit(null));
  await waitFor(() =>
    expect(screen.queryByText("Private records")).not.toBeInTheDocument(),
  );
});
it("ignores late authorization after the session is gone", async () => {
  let resolve!: (v: unknown) => void;
  const pending = new Promise((r) => {
    resolve = r;
  });
  const f = fake(pending);
  render(
    <AuthProvider client={f.client}>
      <p>Private records</p>
    </AuthProvider>,
  );
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
  act(() => f.emit(null));
  await act(async () => resolve({ data: true, error: null }));
  expect(screen.queryByText("Private records")).not.toBeInTheDocument();
});

it("keeps the sign-in inputs after a failed login", async () => {
  const f = fake();
  vi.spyOn(f.client.auth, "getSession").mockResolvedValue({
    data: { session: null },
    error: null,
  });
  render(
    <AuthProvider client={f.client}>
      <p>Private records</p>
    </AuthProvider>,
  );
  const email = await screen.findByLabelText("Email address");
  const user = userEvent.setup();
  await user.type(email, "owner@example.com");
  await user.type(screen.getByLabelText("Password"), "example-password");
  await user.click(screen.getByRole("button", { name: /Enter your space/ }));
  await screen.findByText("Invalid login credentials");
  expect(screen.getByLabelText("Password")).toHaveValue("example-password");
  expect(screen.queryByText("Private records")).not.toBeInTheDocument();
});

function Draft() {
  const { signOut } = useAuth();
  return (
    <>
      <input aria-label="Unsaved note" defaultValue="" />
      <button
        onClick={() => {
          void signOut();
        }}
      >
        Log out
      </button>
      <p>Owner content</p>
    </>
  );
}
it("preserves a draft while refreshing authorization for the same owner", async () => {
  const f = fake();
  render(
    <AuthProvider client={f.client}>
      <Draft />
    </AuthProvider>,
  );
  const input = await screen.findByLabelText("Unsaved note");
  await userEvent.type(input, "Keep this draft");
  act(() => f.emit({ user: { id: "owner" } }));
  await screen.findByLabelText("Unsaved note");
  expect(screen.getByLabelText("Unsaved note")).toHaveValue("Keep this draft");
});
it("cannot restore owner content while sign-out is still in flight", async () => {
  const f = fake();
  vi.spyOn(f.client.auth, "signOut").mockImplementation(
    () => new Promise(() => {}),
  );
  render(
    <AuthProvider client={f.client}>
      <Draft />
    </AuthProvider>,
  );
  await screen.findByText("Owner content");
  let approve!: (value: unknown) => void;
  f.setApproval(
    new Promise((r) => {
      approve = r;
    }),
  );
  act(() => f.emit({ user: { id: "owner" } }));
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
  const button = screen.queryByRole("button", { name: "Log out" });
  if (button) await userEvent.click(button);
  else
    throw new Error(
      "Refreshing the same owner must keep its controls mounted.",
    );
  await act(async () => approve({ data: true, error: null }));
  expect(screen.queryByText("Owner content")).not.toBeInTheDocument();
});

it("blocks auth events arriving after intentional sign-out begins", async () => {
  const f = fake();
  vi.spyOn(f.client.auth, "signOut").mockImplementation(
    () => new Promise(() => {}),
  );
  render(
    <AuthProvider client={f.client}>
      <Draft />
    </AuthProvider>,
  );
  await screen.findByText("Owner content");
  await userEvent.click(screen.getByRole("button", { name: "Log out" }));
  act(() => f.emit({ user: { id: "owner" } }));
  await act(async () => {
    await new Promise((r) => setTimeout(r, 10));
  });
  expect(screen.queryByText("Owner content")).not.toBeInTheDocument();
});

it("expires private content and ignores an outstanding refresh approval", async () => {
  vi.useFakeTimers();
  try {
    const f = fake();
    vi.spyOn(f.client.auth, "getSession").mockResolvedValue({
      data: {
        session: {
          user: { id: "owner" },
          expires_at: Math.floor(Date.now() / 1000) + 2,
        } as any,
      },
      error: null,
    });
    render(
      <AuthProvider client={f.client}>
        <Draft />
      </AuthProvider>,
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(screen.getByText("Owner content")).toBeInTheDocument();
    let approve!: (value: unknown) => void;
    f.setApproval(
      new Promise((r) => {
        approve = r;
      }),
    );
    act(() =>
      f.emit({
        user: { id: "owner" },
        expires_at: Math.floor(Date.now() / 1000) + 1,
      }),
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2100);
    });
    expect(screen.queryByText("Owner content")).not.toBeInTheDocument();
    await act(async () => approve({ data: true, error: null }));
    expect(screen.queryByText("Owner content")).not.toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});
