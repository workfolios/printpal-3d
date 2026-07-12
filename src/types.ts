import type { ApiResponseEnvelope } from "./domain/schemas/apiSchema";
import type { PlanContent } from "./domain/schemas/planSchema";

export interface PrintPlanningFormData {
  projectName: string;
  printGoal: string;
  printerTech: string;
  printerName: string;
  material: string;
  purpose: string;
  priority: string;
  concerns: string[];
  notes: string;
  successCriteria?: string[];
  sourceReferenceSummaries?: string[];
}

export type PrintPlanningCard = PlanContent;
export type PrintPlanningEnvelope = ApiResponseEnvelope<PlanContent>;

export interface FailureReviewFormData {
  whatHappened: string;
  printerTech: string;
  material: string;
  whenAppeared: string;
  whatChanged: string;
  photosAvailable: string;
  whatTried: string;
}

export interface FailureReviewCard {
  likelyAreasToCheck: string[];
  missingContext: string[];
  nextSafeDocumentationStep: string;
  sourceCheckReminder: string;
}

export interface MaterialCompassFormData {
  material: string;
  purpose: string;
  property: string;
  concerns: string;
}

export interface MaterialCompassCard {
  questionsToVerify: string[];
  sourceDocsToCheck: string[];
  materialBehavior: string[];
  documentationPrompts: string[];
}
