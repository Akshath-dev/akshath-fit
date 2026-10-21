import { it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createFitnessRepository } from "./supabase-repository";
it("keeps partial nutrition and binds saves to the verified owner", async () => {
  let payload: Record<string, unknown> = {};
  const client = createClient(
    "https://example.supabase.co",
    "sb_publishable_example",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: crypto.randomUUID(),
      },
      global: {
        fetch: async (_url, init) => {
          payload = JSON.parse(String(init?.body));
          return new Response(
            JSON.stringify([
              {
                date: "2026-10-21",
                calories: null,
                protein: 0,
                carbs: null,
                fat: null,
                notes: "",
              },
            ]),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        },
      },
    },
  );
  const repository = createFitnessRepository(client, "verified-owner");
  const saved = await repository.saveNutrition({
    date: "2026-10-21",
    calories: null,
    protein: 0,
    carbs: null,
    fat: null,
    notes: "",
    ...{ userId: "attacker" },
  });
  expect(payload.user_id).toBe("verified-owner");
  expect(saved.calories).toBeNull();
  expect(saved.protein).toBe(0);
});

it("treats a confirmed training RPC as committed without a fallible second read", async () => {
  const requests: string[] = [];
  const client = createClient(
    "https://example.supabase.co",
    "sb_publishable_example",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: crypto.randomUUID(),
      },
      global: {
        fetch: async (url) => {
          requests.push(String(url));
          const rpc = String(url).includes("/rpc/save_training_session");
          return new Response(
            JSON.stringify(
              rpc ? "saved-session-id" : { message: "Read unavailable" },
            ),
            {
              status: rpc ? 200 : 400,
              headers: { "Content-Type": "application/json" },
            },
          );
        },
      },
    },
  );
  const repository = createFitnessRepository(client, "owner");
  await expect(
    repository.saveTraining({
      date: "2026-10-21",
      kind: "strength",
      activityType: null,
      durationMinutes: null,
      distanceKm: null,
      notes: "",
      muscleGroupIds: ["chest"],
    }),
  ).resolves.toBeUndefined();
  expect(requests).toHaveLength(1);
});

it("loads the complete training week while keeping daily metrics bounded to the selected date", async () => {
  const requests: URL[] = [];
  const client = createClient(
    "https://example.supabase.co",
    "sb_publishable_example",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storageKey: crypto.randomUUID(),
      },
      global: {
        fetch: async (url) => {
          const u = new URL(String(url));
          requests.push(u);
          const row = u.pathname.endsWith("/profiles")
            ? {
                user_id: "owner",
                display_name: "Owner",
                time_zone: "Asia/Kolkata",
              }
            : u.pathname.endsWith("/goals")
              ? {}
              : [];
          return new Response(JSON.stringify(row), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        },
      },
    },
  );
  await createFitnessRepository(client, "owner").getSnapshot({
    start: "2026-07-22",
    end: "2026-10-19",
  });
  expect(
    requests
      .find((u) => u.pathname.endsWith("/training_sessions"))
      ?.searchParams.getAll("date"),
  ).toContain("lte.2026-10-25");
  for (const u of requests.filter((u) =>
    /nutrition_days|daily_checkins/.test(u.pathname),
  )) {
    expect(u.searchParams.getAll("date")).toContain("lte.2026-10-19");
  }
});
