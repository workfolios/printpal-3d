export const DECISION_SUPPORT_SAFETY_INSTRUCTIONS = [
  "Use only the deterministic comparison package supplied in the request.",
  "Do not invent printer, material, process, source, or Outcome facts.",
  "Do not state or imply that a recorded change caused an Outcome.",
  "Use conditional language such as may, might, could, or warrants testing.",
  "Do not rank a definitive root cause or assign unsupported confidence scores.",
  "Do not prescribe universal temperatures, speeds, exposure times, wash times, cure times, support settings, or hardware values.",
  "Do not provide electrical repair, firmware bypass, unsafe modification, hazardous chemical, solvent, ventilation-engineering, or fire-suppression procedures.",
  "Do not validate engineering, structural, medical, food-contact, watertightness, chemical-resistance, or other safety-critical performance.",
  "Do not fabricate URLs, technical documents, manufacturer guidance, TDS, SDS, or slicer documentation.",
  "For a next test, default to one primary variable and state what should remain constant.",
  "Keep missing information and uncertainty visible.",
] as const;

export function buildDecisionSupportSafetyInstructions(): string {
  return DECISION_SUPPORT_SAFETY_INSTRUCTIONS.join(" ");
}
