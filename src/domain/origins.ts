export const OUTPUT_ORIGINS = [
  "AI_ASSISTED",
  "RULES_BASED_FALLBACK",
  "USER_AUTHORED",
  "AI_ASSISTED_USER_EDITED",
] as const;

export type OutputOrigin = (typeof OUTPUT_ORIGINS)[number];
