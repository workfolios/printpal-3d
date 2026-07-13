import type { NextTestPlanContent } from "../domain/types";
import type {
  ComparisonInterpretationContent,
  DeterministicComparisonPackage,
  InterpretationResponseEnvelope,
  NextTestResponseEnvelope,
} from "./contracts";
import {
  COMPARISON_INTERPRETATION_PROMPT_VERSION,
  COMPARISON_INTERPRETATION_RULES_VERSION,
  NEXT_TEST_PROMPT_VERSION,
  NEXT_TEST_RULES_VERSION,
} from "./contracts";

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function primaryVariableFromFacts(facts: DeterministicComparisonPackage): string {
  const declared = facts.intentionalChanges[0];
  if (declared) return declared;
  const changed = facts.changes[0]?.label;
  if (changed) return changed;
  return "One clearly documented process variable selected by the user";
}

export function buildRulesBasedInterpretation(
  facts: DeterministicComparisonPackage,
): ComparisonInterpretationContent {
  const changeCount = facts.changes.length;
  const outcomeCount = facts.outcomeDifferences.length;
  const modelInferences = facts.changes.slice(0, 3).map(
    (change) =>
      `${change.label} may be relevant to the recorded Outcome differences, but the comparison does not establish causation.`,
  );
  if (modelInferences.length === 0) {
    modelInferences.push(
      "The governed comparison did not identify a changed structured field that can be isolated as a candidate explanation.",
    );
  }

  const alternateExplanations = unique([
    ...facts.unknownChanges.slice(0, 3).map(
      (change) => `An undocumented or incompletely described change may also be relevant: ${change}`,
    ),
    ...facts.missingInformation.slice(0, 3).map(
      (item) => `Missing information may limit interpretation: ${item}`,
    ),
    "Interactions among multiple recorded or unrecorded variables may explain the Outcome difference.",
  ]);

  return {
    interpretationSummary: `The deterministic record contains ${changeCount} changed governed field${changeCount === 1 ? "" : "s"} and ${outcomeCount} recorded Outcome difference${outcomeCount === 1 ? "" : "s"}. These associations identify what warrants controlled testing; they do not identify a proven cause.`,
    modelInferences,
    alternateExplanations,
    interpretationUncertainties: unique([
      ...facts.deterministicUncertainties,
      ...facts.missingInformation,
      "The interpretation is bounded by the completeness and accuracy of the saved Attempts.",
    ]),
    interpretationSourceChecks: [
      "Review manufacturer, slicer, profile, TDS, or SDS documentation relevant to the selected primary variable before running another test.",
    ],
  };
}

export function generateRulesBasedInterpretationEnvelope(
  facts: DeterministicComparisonPackage,
  options: { generatedAt?: string; warning?: string; errorCode?: string } = {},
): InterpretationResponseEnvelope {
  return {
    ok: true,
    data: buildRulesBasedInterpretation(facts),
    origin: "RULES_BASED_FALLBACK",
    promptVersion: COMPARISON_INTERPRETATION_PROMPT_VERSION,
    rulesVersion: COMPARISON_INTERPRETATION_RULES_VERSION,
    warnings: options.warning ? [options.warning] : [],
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    errorCode: options.errorCode,
  };
}

export function buildRulesBasedNextTest(
  facts: DeterministicComparisonPackage,
): NextTestPlanContent {
  const primaryVariable = primaryVariableFromFacts(facts);
  const constants = facts.constants.slice(0, 6).map((constant) => constant.label);
  const observationTargets = facts.outcomeDifferences.length > 0
    ? facts.outcomeDifferences.slice(0, 4)
    : ["Record the same success criteria and observable Outcome evidence for the next Attempt."];

  return {
    testQuestion: `What changes in the recorded Outcome when ${primaryVariable} is tested while the listed constants are preserved?`,
    primaryVariable,
    constants: constants.length > 0
      ? constants
      : ["Keep all other documented printer, material, and process context unchanged where practical."],
    observationOrMeasurementPlan: unique([
      ...observationTargets,
      "Record any unexpected condition and identify any additional variable that changed during the test.",
    ]),
    sourceChecks: [
      "Verify the selected variable against the relevant manufacturer, slicer, profile, TDS, or SDS documentation before printing.",
    ],
    expectedLearning: `Determine whether changing ${primaryVariable} is associated with a repeatable difference in the recorded Outcome while other documented context remains stable.`,
    uncertainty: unique([
      ...facts.missingInformation,
      "A single follow-up Attempt cannot prove causation; repeated controlled evidence may still be required.",
    ]),
  };
}

export function generateRulesBasedNextTestEnvelope(
  facts: DeterministicComparisonPackage,
  options: { generatedAt?: string; warning?: string; errorCode?: string } = {},
): NextTestResponseEnvelope {
  return {
    ok: true,
    data: buildRulesBasedNextTest(facts),
    origin: "RULES_BASED_FALLBACK",
    promptVersion: NEXT_TEST_PROMPT_VERSION,
    rulesVersion: NEXT_TEST_RULES_VERSION,
    warnings: options.warning ? [options.warning] : [],
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    errorCode: options.errorCode,
  };
}
