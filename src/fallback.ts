import { PrintPlanningFormData, PrintPlanningCard } from "./types";

export function generateClientFallbackCard(inputs: PrintPlanningFormData): PrintPlanningCard {
  const {
    projectName,
    printGoal,
    printerTech,
    printerName,
    material,
    purpose,
    priority,
    concerns,
    notes
  } = inputs;

  let techConsiderations = "Verify manufacturer guidelines for your selected technology.";
  if (printerTech === "Bed Slinger FDM") {
    techConsiderations = "Bed Slingers have a moving Y-axis. Consider part orientation to minimize wobble and ensure adequate bed adhesion.";
  } else if (printerTech === "CoreXY / Enclosed FDM") {
    techConsiderations = "Enclosed CoreXY systems manage heat well, but ensure the ambient temperature does not cause heat creep in the hotend.";
  } else if (printerTech === "LCD Resin" || printerTech === "SLA Resin" || printerTech === "DLP Resin") {
    techConsiderations = "Resin printing requires careful handling. Ensure your vat, build platform, and resin condition are optimal, and verify manufacturer post-processing workflows.";
  }

  const baseAssumptions = [
    !printerName && "Printer model was not specified.",
    "Exact material brand is unknown.",
    "Slicer profile, environmental conditions, and end-use requirements are assumed to be standard unless specified.",
    notes ? `Note provided: "${notes}". Further specifics may need verification.` : null
  ].filter(Boolean) as string[];

  const readinessChecklist = [
    "Verify the build surface is clean and ready.",
    "Check that your material/resin is in good condition.",
    "Compare your slicer settings to the manufacturer recommendations."
  ];

  if (notes) {
    readinessChecklist.push("Review your additional notes against official documentation before proceeding.");
  }

  return {
    quickRead: `You are printing "${projectName || 'a project'}" in ${material || 'the selected material'} with a focus on ${priority || 'the main priority'}. The goal is to produce a ${purpose ? purpose.toLowerCase() : 'custom'} part for: ${printGoal || 'your stated purpose'}. Please proceed cautiously and follow standard preparations.`,
    printerTechConsiderations: techConsiderations,
    materialWatchOuts: `For ${material || 'this material'}, always consult the manufacturer's Technical Data Sheet for optimal handling and environmental requirements. Watch for moisture or deterioration.`,
    riskFlags: [
      `Priority is ${priority || 'noted'}, which may require tuning specific slicer parameters.`,
      ...(concerns || []).map((c: string) => `Monitored concern: ${c}. Review slicing strategy for this area.`)
    ],
    readinessChecklist,
    postPrintNotes: [
      "Allow parts to cool or drain completely before removal.",
      "Follow safe handling procedures during post-processing and cleanup.",
      "Avoid rushing support removal to prevent part damage."
    ],
    whatToDocument: [
      "Document the ambient temperature and humidity.",
      "Note the exact material brand and color used.",
      "Record any anomalies during the first layers."
    ],
    assumptionsAndGaps: baseAssumptions.length > 0 ? baseAssumptions : ["No major missing information detected."],
    friendlyNote: "Planning is the best way to avoid failed prints. Take your time setting up, and happy printing!"
  };
}
