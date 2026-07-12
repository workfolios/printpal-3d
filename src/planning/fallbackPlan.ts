import type { ApiResponseEnvelope } from "../domain/schemas/apiSchema";
import type { PlanContent } from "../domain/schemas/planSchema";
import {
  PLANNING_PROMPT_VERSION,
  PLANNING_RULES_VERSION,
  type PlanningRequest,
} from "./contracts";

function compact(items: Array<string | undefined | false>): string[] {
  return items.filter((item): item is string => Boolean(item && item.trim()));
}

export function generateRulesBasedPlanContent(input: PlanningRequest): PlanContent {
  const printerKnown = input.printerName.trim().length > 0;
  const materialKnown = input.material.trim().length > 0;
  const hasSources = input.sourceReferenceSummaries.length > 0;

  return {
    objectiveSummary: `Prepare a documented attempt for ${input.projectName}. The recorded purpose is ${input.purpose.toLowerCase()}, and the immediate print intent is: ${input.printGoal}`,
    readinessConsiderations: [
      "Review the saved printer, material, and process context before preparing the job.",
      "Confirm that the selected slicer profile and user-entered settings still match the intended printer and material combination.",
      "Record any condition, setup, or environment detail that could make the attempt difficult to repeat later.",
      ...(input.notes ? ["Review the user-entered notes as context; do not treat recorded values as PrintPal recommendations."] : []),
    ],
    printerWatchOuts: compact([
      `Verify printer-specific preparation and operating requirements for ${input.printerTech} against the applicable printer manual and slicer documentation.`,
      !printerKnown && "The exact printer model is not recorded, so model-specific requirements remain unknown.",
    ]),
    materialWatchOuts: compact([
      `Verify handling, conditioning, compatibility, and post-processing requirements for ${materialKnown ? input.material : "the selected material"} against manufacturer documentation, the applicable TDS, and the applicable SDS.`,
    ]),
    assumptions: compact([
      "The saved project purpose and success criteria accurately represent the intended use of this attempt.",
      input.priority ? `The recorded planning emphasis is: ${input.priority}.` : "No single planning priority was specified.",
      input.notes ? "User-entered freeform and technical notes are context supplied by the user." : false,
    ]),
    missingInformation: compact([
      !printerKnown && "Printer manufacturer and model are not fully recorded.",
      !hasSources && "No authoritative source reference is currently attached to the planning request.",
      !input.notes && "No additional process, environment, or settings context was supplied for this planning request.",
    ]),
    sourceChecks: [
      "Check the printer manual and the slicer documentation applicable to the saved printer context.",
      "Check manufacturer material guidance, the Technical Data Sheet, and the Safety Data Sheet applicable to the saved material context.",
      ...input.sourceReferenceSummaries.map((source) => `Review the user-provided source reference: ${source}`),
    ],
    variablesToRecord: [
      "Printer and material identity used for the attempt.",
      "Slicer and profile reference used for the attempt.",
      "User-entered settings or process changes that differ from the saved baseline.",
      "Relevant environmental or material-condition observations.",
      ...input.concerns.map((concern) => `Observation related to the recorded concern: ${concern}.`),
    ],
    expectedOutcomeCriteria:
      input.successCriteria.length > 0
        ? input.successCriteria
        : ["Evaluate the completed print against the project purpose and document whether the intended result was achieved."],
  };
}

export function generateRulesBasedPlanEnvelope(
  input: PlanningRequest,
  options: { warning?: string; errorCode?: string; generatedAt?: string } = {},
): ApiResponseEnvelope<PlanContent> {
  return {
    ok: true,
    data: generateRulesBasedPlanContent(input),
    origin: "RULES_BASED_FALLBACK",
    promptVersion: PLANNING_PROMPT_VERSION,
    rulesVersion: PLANNING_RULES_VERSION,
    warnings: [
      options.warning ??
        "Gemini was unavailable or its response could not be validated. A labeled rules-based planning draft was generated.",
    ],
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    errorCode: options.errorCode ?? "AI_UNAVAILABLE",
  };
}
