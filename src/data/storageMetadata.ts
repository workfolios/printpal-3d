export const LOCAL_STORAGE_DISCLOSURE = {
  storageModel: "LOCAL_FIRST_BROWSER_RESIDENT",
  userModel: "SINGLE_USER_NO_AUTHENTICATION",
  warning:
    "PrintPal records are stored in this browser. Clearing site data, changing browsers, or moving to a different application origin may remove access to these records unless a backup is exported.",
  backupRecommendation:
    "Export a PrintPal backup periodically and before changing browsers, devices, or deployment URLs.",
} as const;
