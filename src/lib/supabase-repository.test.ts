import { it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createFitnessRepository } from "./supabase-repository";
it("keeps partial nutrition and binds saves to the verified owner", async () => {
  let payload: Record<string, unknown> = {};
  const client = createClient(
    "https://example.supabase.co",
    "sb_publishable_example",
    {
      auth: { persistSession: false, autoRefreshToken: false },
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
