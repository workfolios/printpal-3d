export type ServerRuntimeKind = "CODESPACES" | "SERVER";
export type RuntimeKind = ServerRuntimeKind | "STATIC_DEMO";
export type RuntimeAiMode = "AI_AVAILABLE" | "STANDARD_GUIDANCE";

export interface ServerRuntimeStatus {
  ok: true;
  runtime: ServerRuntimeKind;
  aiConfigured: boolean;
  aiMode: RuntimeAiMode;
  productVersion: "V0.4";
  sourceCheckpoint: string;
  models: {
    planning: string;
    decisionSupport: string;
    referenceTools: string;
  };
  versions: {
    planningPrompt: string;
    planningRules: string;
    interpretationPrompt: string;
    interpretationRules: string;
    nextTestPrompt: string;
    nextTestRules: string;
  };
  checkedAt: string;
}

export interface RuntimeStatusView {
  runtime: RuntimeKind;
  aiMode: RuntimeAiMode;
  aiConfigured: boolean;
  detail: string;
  server?: ServerRuntimeStatus;
}

export const STATIC_DEMO_RUNTIME_STATUS: RuntimeStatusView = {
  runtime: "STATIC_DEMO",
  aiMode: "STANDARD_GUIDANCE",
  aiConfigured: false,
  detail: "Static demo. Server-side AI is unavailable; core browser-resident records remain usable.",
};

function isServerRuntimeStatus(value: unknown): value is ServerRuntimeStatus {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ServerRuntimeStatus>;
  return (
    candidate.ok === true &&
    (candidate.runtime === "CODESPACES" || candidate.runtime === "SERVER") &&
    typeof candidate.aiConfigured === "boolean" &&
    (candidate.aiMode === "AI_AVAILABLE" || candidate.aiMode === "STANDARD_GUIDANCE") &&
    candidate.productVersion === "V0.4" &&
    typeof candidate.sourceCheckpoint === "string" &&
    typeof candidate.checkedAt === "string"
  );
}

export async function loadRuntimeStatus(
  fetchImpl: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<RuntimeStatusView> {
  try {
    const response = await fetchImpl("/api/runtime-status", {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });

    if (!response.ok) return STATIC_DEMO_RUNTIME_STATUS;
    const payload: unknown = await response.json();
    if (!isServerRuntimeStatus(payload)) return STATIC_DEMO_RUNTIME_STATUS;

    const runtimeLabel = payload.runtime === "CODESPACES" ? "Codespaces full runtime" : "Full server runtime";
    return {
      runtime: payload.runtime,
      aiMode: payload.aiMode,
      aiConfigured: payload.aiConfigured,
      detail: payload.aiConfigured
        ? `${runtimeLabel}. Gemini-assisted routes are available with labeled fallback behavior.`
        : `${runtimeLabel}. Gemini is not configured; labeled Standard Guidance fallback remains available.`,
      server: payload,
    };
  } catch {
    return STATIC_DEMO_RUNTIME_STATUS;
  }
}
