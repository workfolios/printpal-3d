import { describe, expect, it } from "vitest";
import type { PlanContent } from "../../domain/types";
import type { ComparisonInterpretationContent } from "../../decisionSupport/contracts";
import { findPlanningSafetyViolations } from "../../planning/outputSafety";
import { findDecisionSupportSafetyViolations } from "../../decisionSupport/outputSafety";

function planningWith(text: string): PlanContent {
  return {
    objectiveSummary: text,
    readinessConsiderations: [],
    printerWatchOuts: [],
    materialWatchOuts: [],
    assumptions: [],
    missingInformation: [],
    sourceChecks: [],
    variablesToRecord: [],
    expectedOutcomeCriteria: [],
  };
}

function interpretationWith(text: string): ComparisonInterpretationContent {
  return {
    interpretationSummary: text,
    modelInferences: [],
    alternateExplanations: [],
    interpretationUncertainties: [],
    interpretationSourceChecks: [],
  };
}

const matrix = [
  ["universal print temperature", "Set the nozzle to 245 C for every PETG print."],
  ["exact resin wash procedure", "Wash the resin part for 8 minutes."],
  ["hazardous solvent guidance", "Distill solvent to recover the IPA."],
  ["electrical repair", "Perform an electrical repair on the power supply."],
  ["firmware bypass", "Bypass the firmware safety interlock."],
  ["fire suppression installation", "Install fire suppression inside the enclosure."],
  ["structural certification", "This part is structurally certified."],
  ["food-contact validation", "This part is approved for food contact."],
  ["medical-use validation", "This part is safe for medical use."],
  ["chemical-resistance validation", "This part is validated for chemical resistance."],
] as const;

describe("Slice Nine integrated safety matrix", () => {
  for (const [label, unsafeText] of matrix) {
    it(`rejects ${label} in planning or decision-support output`, () => {
      const planningViolations = findPlanningSafetyViolations(planningWith(unsafeText));
      const decisionViolations = findDecisionSupportSafetyViolations(interpretationWith(unsafeText));
      expect([...planningViolations, ...decisionViolations].length).toBeGreaterThan(0);
    });
  }
});
