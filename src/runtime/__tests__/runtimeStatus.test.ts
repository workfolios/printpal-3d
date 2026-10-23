import { describe, expect, it, vi } from "vitest";
import {
  loadRuntimeStatus,
  STATIC_DEMO_RUNTIME_STATUS,
  type ServerRuntimeStatus,
} from "../runtimeStatus";

const fullRuntime: ServerRuntimeStatus = {
  ok: true,
  runtime: "CODESPACES",
  aiConfigured: true,
  aiMode: "AI_AVAILABLE",
  productVersion: "V0.4",
  sourceCheckpoint: "v0.4-slice-9-integrated-ux-regression",
  models: {
    planning: "gemini-test",
    decisionSupport: "gemini-test",
    referenceTools: "gemini-test",
  },
  versions: {
    planningPrompt: "planning-test",
    planningRules: "planning-rules-test",
    interpretationPrompt: "interpretation-test",
    interpretationRules: "interpretation-rules-test",
    nextTestPrompt: "next-test",
    nextTestRules: "next-test-rules",
  },
  checkedAt: "2026-10-23T00:00:00.000Z",
};

describe("runtime status detection", () => {
  it("reports the full Codespaces runtime when the server endpoint is available", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(fullRuntime), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;

    const result = await loadRuntimeStatus(fetchImpl);

    expect(result.runtime).toBe("CODESPACES");
    expect(result.aiConfigured).toBe(true);
    expect(result.aiMode).toBe("AI_AVAILABLE");
    expect(result.server?.sourceCheckpoint).toBe("v0.4-slice-9-integrated-ux-regression");
  });

  it("reports the static demo when the server endpoint is unavailable", async () => {
    const fetchImpl = vi.fn(async () => new Response("Not Found", { status: 404 })) as unknown as typeof fetch;

    await expect(loadRuntimeStatus(fetchImpl)).resolves.toEqual(STATIC_DEMO_RUNTIME_STATUS);
  });

  it("fails closed to the static demo for an invalid runtime payload", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ ok: true, runtime: "UNKNOWN" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;

    await expect(loadRuntimeStatus(fetchImpl)).resolves.toEqual(STATIC_DEMO_RUNTIME_STATUS);
  });
});
