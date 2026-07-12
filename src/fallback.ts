import type { PlanningRequest } from "./planning/contracts";
import { generateRulesBasedPlanContent, generateRulesBasedPlanEnvelope } from "./planning/fallbackPlan";
import type { PrintPlanningCard, PrintPlanningEnvelope, PrintPlanningFormData } from "./types";

function normalizeInput(inputs: PrintPlanningFormData): PlanningRequest {
  return {
    projectName: inputs.projectName || "Untitled print",
    printGoal: inputs.printGoal || "Create the described print",
    printerTech: inputs.printerTech || "Unknown printer technology",
    printerName: inputs.printerName || "",
    material: inputs.material || "Unknown material",
    purpose: inputs.purpose || "Documented print attempt",
    priority: inputs.priority || "",
    concerns: inputs.concerns ?? [],
    notes: inputs.notes || "",
    successCriteria: inputs.successCriteria ?? [],
    sourceReferenceSummaries: inputs.sourceReferenceSummaries ?? [],
  };
}

export function generateClientFallbackCard(inputs: PrintPlanningFormData): PrintPlanningCard {
  return generateRulesBasedPlanContent(normalizeInput(inputs));
}

export function generateClientFallbackEnvelope(inputs: PrintPlanningFormData): PrintPlanningEnvelope {
  return generateRulesBasedPlanEnvelope(normalizeInput(inputs), {
    warning: "The planning service could not be reached. A labeled local rules-based draft was generated.",
    errorCode: "CLIENT_SERVICE_UNAVAILABLE",
  });
}
