export const PRESENTATION_MODES = ["GUIDED", "TECHNICAL"] as const;
export type PresentationMode = (typeof PRESENTATION_MODES)[number];

export function isPresentationMode(value: unknown): value is PresentationMode {
  return PRESENTATION_MODES.includes(value as PresentationMode);
}
