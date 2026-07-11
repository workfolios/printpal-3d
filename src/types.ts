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
}

export interface PrintPlanningCard {
  quickRead: string;
  printerTechConsiderations: string;
  materialWatchOuts: string;
  riskFlags: string[];
  readinessChecklist: string[];
  postPrintNotes: string[];
  whatToDocument: string[];
  assumptionsAndGaps: string[];
  friendlyNote: string;
}

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
