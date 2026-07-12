import { useLiveQuery } from "dexie-react-hooks";
import { useCallback } from "react";
import {
  isPresentationMode,
  type PresentationMode,
} from "../app/presentationMode";
import { settingsRepository } from "../data/repositories/instances";

const MODE_SETTING_KEY = "presentationMode";

export function usePresentationMode() {
  const stored = useLiveQuery(() => settingsRepository.get(MODE_SETTING_KEY), []);
  const mode: PresentationMode = isPresentationMode(stored?.value) ? stored.value : "GUIDED";

  const setMode = useCallback(async (nextMode: PresentationMode) => {
    await settingsRepository.set(MODE_SETTING_KEY, nextMode);
  }, []);

  return { mode, setMode };
}
