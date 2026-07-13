import type { ComparisonInterpretationContent } from "./contracts";
import type { NextTestPlanContent } from "../domain/types";

const PROHIBITED_PATTERNS: Array<[RegExp, string]> = [
  [/\b(the|this) (root )?cause (is|was)\b/i, "definitive causal claim"],
  [/\b(definitely|certainly|confirmed cause|caused by|proves that|proof that)\b/i, "unsupported certainty or causation"],
  [/\bset\b.{0,40}\bto\s*-?\d+(?:\.\d+)?\s*(?:°?[cf]|mm\/s|mm|s|sec|seconds?|minutes?|%)\b/i, "prescriptive operating value"],
  [/\b(?:increase|decrease|change|adjust)\b.{0,40}\bto\s*-?\d+(?:\.\d+)?\b/i, "prescriptive numeric adjustment"],
  [/\b(?:bypass|disable)\b.{0,30}\b(?:safety|thermal|firmware|interlock)\b/i, "safety bypass guidance"],
  [/\b(?:rewire|mains voltage|electrical repair|distill solvent|recover solvent)\b/i, "hazardous procedural guidance"],
  [/https?:\/\//i, "fabricated or unverified URL"],
  [/\b(?:certified|validated|safe for|approved for)\b.{0,40}\b(?:medical|food contact|load bearing|structural|chemical resistance|watertight)\b/i, "unsupported performance validation"],
];

function flattenInterpretation(content: ComparisonInterpretationContent): string[] {
  return [
    content.interpretationSummary,
    ...content.modelInferences,
    ...content.alternateExplanations,
    ...content.interpretationUncertainties,
    ...content.interpretationSourceChecks,
  ];
}

function flattenNextTest(content: NextTestPlanContent): string[] {
  return [
    content.testQuestion,
    content.primaryVariable,
    content.supportingVariable ?? "",
    ...content.constants,
    ...content.observationOrMeasurementPlan,
    ...content.sourceChecks,
    content.expectedLearning,
    ...content.uncertainty,
  ];
}

function isInterpretationContent(
  content: ComparisonInterpretationContent | NextTestPlanContent,
): content is ComparisonInterpretationContent {
  return typeof (content as ComparisonInterpretationContent).interpretationSummary === "string";
}

export function findDecisionSupportSafetyViolations(
  content: ComparisonInterpretationContent | NextTestPlanContent,
): string[] {
  const values = isInterpretationContent(content)
    ? flattenInterpretation(content)
    : flattenNextTest(content);
  const text = values.join("\n");
  return PROHIBITED_PATTERNS.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}

export function assertDecisionSupportOutputSafe<T extends ComparisonInterpretationContent | NextTestPlanContent>(
  content: T,
): T {
  const violations = findDecisionSupportSafetyViolations(content);
  if (violations.length > 0) {
    throw new Error(`Decision-support output violated safety controls: ${violations.join(", ")}`);
  }
  return content;
}
