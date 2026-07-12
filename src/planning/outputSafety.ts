import type { PlanContent } from "../domain/types";

const BLOCKED_PATTERNS: Array<{ label: string; pattern: RegExp }> = [
  {
    label: "prescriptive universal operating value",
    pattern: /\b(?:set|use|print\s+at|heat\s+to|run\s+at|expose\s+for|wash\s+for|cure\s+for)\b.{0,32}\b\d+(?:\.\d+)?\s*(?:°\s*[cf]|c|f|mm\/s|mm\/min|seconds?|minutes?|hours?)\b/i,
  },
  {
    label: "electrical, firmware, or modification instruction",
    pattern: /\b(?:wire|rewire|bypass|flash\s+firmware|disable\s+thermal|install\s+fire\s+suppression|modify\s+the\s+power)\b/i,
  },
  {
    label: "hazardous chemical procedure",
    pattern: /\b(?:mix|combine|neutralize|distill|evaporate|dispose\s+of)\b.{0,36}\b(?:resin|solvent|ipa|isopropyl|acetone|chemical\s+waste)\b/i,
  },
  {
    label: "unsupported performance or safety certification claim",
    pattern: /\b(?:is|will\s+be|certified\s+as|guaranteed)\b.{0,24}\b(?:food[- ]safe|medical[- ]safe|load[- ]bearing|structurally\s+certified|chemically\s+resistant|watertight)\b/i,
  },
  {
    label: "fabricated URL",
    pattern: /https?:\/\//i,
  },
];

function collectPlanText(plan: PlanContent): string {
  return [
    plan.objectiveSummary,
    ...plan.readinessConsiderations,
    ...plan.printerWatchOuts,
    ...plan.materialWatchOuts,
    ...plan.assumptions,
    ...plan.missingInformation,
    ...plan.sourceChecks,
    ...plan.variablesToRecord,
    ...plan.expectedOutcomeCriteria,
  ].join("\n");
}

export function findPlanningSafetyViolations(plan: PlanContent): string[] {
  const text = collectPlanText(plan);
  return BLOCKED_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
}

export function assertPlanningOutputSafe(plan: PlanContent): PlanContent {
  const violations = findPlanningSafetyViolations(plan);
  if (violations.length > 0) {
    throw new Error(`Planning output failed safety validation: ${violations.join(", ")}`);
  }
  return plan;
}
