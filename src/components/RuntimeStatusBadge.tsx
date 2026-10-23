import { CircleDot, Cloud, Server, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import {
  loadRuntimeStatus,
  STATIC_DEMO_RUNTIME_STATUS,
  type RuntimeStatusView,
} from "../runtime/runtimeStatus";

export function RuntimeStatusBadge({ className = "" }: { className?: string }) {
  const [status, setStatus] = useState<RuntimeStatusView>(STATIC_DEMO_RUNTIME_STATUS);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2500);

    loadRuntimeStatus(fetch, controller.signal)
      .then(setStatus)
      .finally(() => {
        window.clearTimeout(timeout);
        setChecking(false);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  const isStatic = status.runtime === "STATIC_DEMO";
  const isCodespaces = status.runtime === "CODESPACES";
  const label = checking
    ? "Checking runtime"
    : isStatic
      ? "Static Demo"
      : isCodespaces
        ? "Full Runtime"
        : "Server Runtime";

  const secondary = checking
    ? "Detecting server"
    : status.aiConfigured
      ? "AI Assisted"
      : "Standard Guidance";

  const Icon = isStatic ? Cloud : status.aiConfigured ? ShieldCheck : Server;

  return (
    <div
      className={`items-center gap-2 rounded border border-[#D6D4CC] bg-[#F8F7F2] px-3 py-2 ${className}`}
      role="status"
      aria-live="polite"
      title={status.detail}
    >
      <Icon className="h-4 w-4 shrink-0 text-[#4B7270]" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-[9px] font-bold uppercase tracking-widest text-[#333333]">{label}</span>
        <span className="mt-0.5 flex items-center gap-1 text-[9px] text-[#6F6F6F]">
          <CircleDot className="h-2.5 w-2.5" aria-hidden="true" />
          {secondary}
        </span>
      </span>
    </div>
  );
}
