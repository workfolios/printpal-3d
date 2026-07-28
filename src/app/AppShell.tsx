import {
  BookOpen,
  Database,
  FilePlus2,
  FlaskConical,
  Menu,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FailureReview } from "../components/FailureReview";
import { MaterialCompass } from "../components/MaterialCompass";
import { usePresentationMode } from "../hooks/usePresentationMode";
import { AttemptDetailScreen } from "../screens/AttemptDetailScreen";
import { ComparisonRecordScreen } from "../screens/ComparisonRecordScreen";
import { ComparisonSetupScreen } from "../screens/ComparisonSetupScreen";
import { DecisionSupportScreen } from "../screens/DecisionSupportScreen";
import { DuplicateAttemptScreen } from "../screens/DuplicateAttemptScreen";
import { LegacyPlannerScreen } from "../screens/LegacyPlannerScreen";
import { NewProjectScreen } from "../screens/NewProjectScreen";
import { OutcomeCaptureScreen } from "../screens/OutcomeCaptureScreen";
import { PlanningRecordScreen } from "../screens/PlanningRecordScreen";
import { RecordLibraryScreen } from "../screens/RecordLibraryScreen";
import { ReferenceToolsScreen } from "../screens/ReferenceToolsScreen";
import { SettingsDataScreen } from "../screens/SettingsDataScreen";
import type { AppRoute } from "./routes";
import { NEW_PROJECT_ROUTE, RECORD_LIBRARY_ROUTE } from "./routes";

const recordRouteNames = new Set<AppRoute["name"]>([
  "RECORD_LIBRARY",
  "ATTEMPT_DETAIL",
  "PLANNING_RECORD",
  "RECORD_OUTCOME",
  "DUPLICATE_ATTEMPT",
  "COMPARE_ATTEMPTS",
  "COMPARISON_RECORD",
  "DECISION_SUPPORT",
]);

const referenceRouteNames = new Set<AppRoute["name"]>([
  "REFERENCE_TOOLS",
  "LEGACY_PLANNER",
  "MATERIAL_COMPASS",
  "FAILURE_REVIEW",
]);

const routeTitles: Record<AppRoute["name"], string> = {
  RECORD_LIBRARY: "Record Library",
  NEW_PROJECT: "New Print Record",
  ATTEMPT_DETAIL: "Attempt Detail",
  PLANNING_RECORD: "Planning Record",
  RECORD_OUTCOME: "Outcome Capture",
  DUPLICATE_ATTEMPT: "Duplicate Attempt",
  COMPARE_ATTEMPTS: "Compare Attempts",
  COMPARISON_RECORD: "Comparison Record",
  DECISION_SUPPORT: "Decision Support",
  SETTINGS_DATA: "Settings And Data",
  REFERENCE_TOOLS: "Reference Tools",
  LEGACY_PLANNER: "Quick Planner",
  MATERIAL_COMPASS: "Materials Compass",
  FAILURE_REVIEW: "Failure Review",
};

export function AppShell() {
  const [route, setRoute] = useState<AppRoute>(RECORD_LIBRARY_ROUTE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const hasMountedRef = useRef(false);
  const { mode, setMode } = usePresentationMode();

  useEffect(() => {
    document.title = `${routeTitles[route.name]} · PrintPal 3D`;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const frame = window.requestAnimationFrame(() => mainRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [route]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen]);

  const navigate = (nextRoute: AppRoute) => {
    setRoute(nextRoute);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const navButtonClass = (active: boolean) =>
    `inline-flex min-h-10 items-center justify-center gap-2 rounded px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${
      active
        ? "bg-[#EDF3F2] text-[#4B7270]"
        : "text-[#6F6F6F] hover:bg-[#F8F7F2] hover:text-[#333333]"
    }`;

  const recordsActive = recordRouteNames.has(route.name);
  const referenceToolsActive = referenceRouteNames.has(route.name);

  const primaryNavigation = (
    <>
      <button
        type="button"
        onClick={() => navigate(RECORD_LIBRARY_ROUTE)}
        className={navButtonClass(recordsActive)}
        aria-current={recordsActive ? "page" : undefined}
      >
        <Database className="h-4 w-4" aria-hidden="true" /> Records
      </button>
      <button
        type="button"
        onClick={() => navigate(NEW_PROJECT_ROUTE)}
        className={navButtonClass(route.name === "NEW_PROJECT")}
        aria-current={route.name === "NEW_PROJECT" ? "page" : undefined}
      >
        <FilePlus2 className="h-4 w-4" aria-hidden="true" /> New Print
      </button>
      <button
        type="button"
        onClick={() => navigate({ name: "REFERENCE_TOOLS" })}
        className={navButtonClass(referenceToolsActive)}
        aria-current={referenceToolsActive ? "page" : undefined}
      >
        <Wrench className="h-4 w-4" aria-hidden="true" /> Reference Tools
      </button>
      <button
        type="button"
        onClick={() => navigate({ name: "SETTINGS_DATA" })}
        className={navButtonClass(route.name === "SETTINGS_DATA")}
        aria-current={route.name === "SETTINGS_DATA" ? "page" : undefined}
      >
        <Settings className="h-4 w-4" aria-hidden="true" /> Settings
      </button>
    </>
  );

  const presentationModeControls = (
    <div className="flex gap-1" role="group" aria-label="Presentation mode">
      <button
        type="button"
        onClick={() => setMode("GUIDED")}
        aria-pressed={mode === "GUIDED"}
        className={`rounded px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition ${
          mode === "GUIDED" ? "bg-white text-[#4B7270] shadow-sm" : "text-[#6F6F6F]"
        }`}
      >
        Guided
      </button>
      <button
        type="button"
        onClick={() => setMode("TECHNICAL")}
        aria-pressed={mode === "TECHNICAL"}
        className={`rounded px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition ${
          mode === "TECHNICAL" ? "bg-white text-[#4B7270] shadow-sm" : "text-[#6F6F6F]"
        }`}
      >
        Technical
      </button>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8F7F2] font-sans text-[#333333]">
      <a
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          window.scrollTo({ top: 0, behavior: "auto" });
          mainRef.current?.focus({ preventScroll: true });
        }}
        className="fixed left-4 top-3 z-50 -translate-y-24 rounded bg-[#333333] px-4 py-2 text-sm font-semibold text-white transition focus:translate-y-0"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-30 border-b border-[#E2E1DB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button type="button" onClick={() => navigate(RECORD_LIBRARY_ROUTE)} className="group min-w-0 text-left" aria-label="Open Records Home">
            <span className="block text-2xl font-light tracking-tight text-[#4B7270] group-hover:text-[#3D5D5B]">
              PrintPal <span className="font-bold text-[#333333]">3D</span>
            </span>
            <span className="hidden text-[9px] uppercase tracking-widest text-[#6F6F6F] sm:block">Decision Memory · V0.4</span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            {primaryNavigation}
          </nav>

          <div className="hidden items-center gap-1 rounded border border-[#D6D4CC] bg-[#F8F7F2] p-1 md:flex">
            {presentationModeControls}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded border border-[#D6D4CC] text-[#4B7270] lg:hidden"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div id="mobile-navigation" className="border-t border-[#E2E1DB] bg-white px-4 py-4 lg:hidden">
            <nav className="grid grid-cols-2 gap-2" aria-label="Mobile primary navigation">
              {primaryNavigation}
            </nav>
            <div className="mt-4 flex items-center justify-between rounded border border-[#D6D4CC] bg-[#F8F7F2] p-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#6F6F6F]">Presentation Mode</span>
              {presentationModeControls}
            </div>
          </div>
        )}
      </header>

      <main
        id="main-content"
        ref={mainRef}
        tabIndex={-1}
        className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-4 py-5 outline-none md:px-6 md:py-6"
      >
        {route.name === "RECORD_LIBRARY" && (
          <RecordLibraryScreen
            onNewProject={() => navigate(NEW_PROJECT_ROUTE)}
            onOpenProject={(projectId, attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId, attemptId })}
            onOpenReferenceTools={() => navigate({ name: "REFERENCE_TOOLS" })}
          />
        )}
        {route.name === "NEW_PROJECT" && (
          <NewProjectScreen
            mode={mode}
            onCancel={() => navigate(RECORD_LIBRARY_ROUTE)}
            onCreated={(projectId, attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId, attemptId })}
          />
        )}
        {route.name === "ATTEMPT_DETAIL" && (
          <AttemptDetailScreen
            projectId={route.projectId}
            attemptId={route.attemptId}
            mode={mode}
            onBack={() => navigate(RECORD_LIBRARY_ROUTE)}
            onOpenPlan={() => navigate({ name: "PLANNING_RECORD", projectId: route.projectId, attemptId: route.attemptId })}
            onOpenReferenceTools={() => navigate({ name: "REFERENCE_TOOLS" })}
            onRecordOutcome={() => navigate({ name: "RECORD_OUTCOME", projectId: route.projectId, attemptId: route.attemptId })}
            onDuplicateAttempt={() => navigate({ name: "DUPLICATE_ATTEMPT", projectId: route.projectId, sourceAttemptId: route.attemptId })}
            onCompareAttempts={() => navigate({ name: "COMPARE_ATTEMPTS", projectId: route.projectId, baselineAttemptId: route.attemptId })}
            onOpenComparison={(comparisonId) => navigate({ name: "COMPARISON_RECORD", projectId: route.projectId, comparisonId, returnAttemptId: route.attemptId })}
            onOpenAttempt={(attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId })}
          />
        )}
        {route.name === "PLANNING_RECORD" && (
          <PlanningRecordScreen
            projectId={route.projectId}
            attemptId={route.attemptId}
            mode={mode}
            onBack={() => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId: route.attemptId })}
          />
        )}
        {route.name === "RECORD_OUTCOME" && (
          <OutcomeCaptureScreen
            projectId={route.projectId}
            attemptId={route.attemptId}
            mode={mode}
            onCancel={() => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId: route.attemptId })}
            onSaved={() => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId: route.attemptId })}
          />
        )}
        {route.name === "DUPLICATE_ATTEMPT" && (
          <DuplicateAttemptScreen
            projectId={route.projectId}
            sourceAttemptId={route.sourceAttemptId}
            mode={mode}
            onCancel={() => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId: route.sourceAttemptId })}
            onCreated={(projectId, attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId, attemptId })}
          />
        )}
        {route.name === "COMPARE_ATTEMPTS" && (
          <ComparisonSetupScreen
            projectId={route.projectId}
            baselineAttemptId={route.baselineAttemptId}
            mode={mode}
            onCancel={() => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId: route.baselineAttemptId })}
            onCreated={(comparisonId) => navigate({ name: "COMPARISON_RECORD", projectId: route.projectId, comparisonId, returnAttemptId: route.baselineAttemptId })}
          />
        )}
        {route.name === "COMPARISON_RECORD" && (
          <ComparisonRecordScreen
            projectId={route.projectId}
            comparisonId={route.comparisonId}
            mode={mode}
            onBack={() => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId: route.returnAttemptId })}
            onOpenAttempt={(attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId })}
            onOpenDecisionSupport={() => navigate({ name: "DECISION_SUPPORT", projectId: route.projectId, comparisonId: route.comparisonId, returnAttemptId: route.returnAttemptId })}
          />
        )}
        {route.name === "DECISION_SUPPORT" && (
          <DecisionSupportScreen
            projectId={route.projectId}
            comparisonId={route.comparisonId}
            mode={mode}
            onBack={() => navigate({ name: "COMPARISON_RECORD", projectId: route.projectId, comparisonId: route.comparisonId, returnAttemptId: route.returnAttemptId })}
            onOpenAttempt={(attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId: route.projectId, attemptId })}
          />
        )}
        {route.name === "SETTINGS_DATA" && (
          <SettingsDataScreen
            onOpenImportedProject={(projectId, attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId, attemptId })}
          />
        )}
        {route.name === "REFERENCE_TOOLS" && (
          <ReferenceToolsScreen
            onOpenPlanner={() => navigate({ name: "LEGACY_PLANNER" })}
            onOpenMaterials={() => navigate({ name: "MATERIAL_COMPASS" })}
            onOpenFailureReview={() => navigate({ name: "FAILURE_REVIEW" })}
          />
        )}
        {route.name === "LEGACY_PLANNER" && <LegacyPlannerScreen onBack={() => navigate({ name: "REFERENCE_TOOLS" })} />}
        {route.name === "MATERIAL_COMPASS" && <MaterialCompass onBack={() => navigate({ name: "REFERENCE_TOOLS" })} />}
        {route.name === "FAILURE_REVIEW" && <FailureReview onBack={() => navigate({ name: "REFERENCE_TOOLS" })} />}
      </main>

      <footer className="border-t border-[#E2E1DB] bg-white">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-4 py-4 text-[10px] leading-relaxed text-[#6F6F6F] md:flex-row md:items-center md:justify-between md:px-6">
          <span className="inline-flex items-center gap-2"><FlaskConical className="h-4 w-4 text-[#4B7270]" aria-hidden="true" /> Records are stored locally in this browser. Export and recovery controls are available in Settings.</span>
          <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#4B7270]" aria-hidden="true" /> Manufacturer documentation, TDS, SDS, and slicer guidance remain authoritative.</span>
        </div>
      </footer>
    </div>
  );
}
