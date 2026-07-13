import {
  AlertTriangle,
  Beaker,
  BookOpen,
  Database,
  FilePlus2,
  FlaskConical,
  Menu,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { useState } from "react";
import { FailureReview } from "../components/FailureReview";
import { MaterialCompass } from "../components/MaterialCompass";
import { usePresentationMode } from "../hooks/usePresentationMode";
import { AttemptDetailScreen } from "../screens/AttemptDetailScreen";
import { ComparisonRecordScreen } from "../screens/ComparisonRecordScreen";
import { ComparisonSetupScreen } from "../screens/ComparisonSetupScreen";
import { DuplicateAttemptScreen } from "../screens/DuplicateAttemptScreen";
import { DecisionSupportScreen } from "../screens/DecisionSupportScreen";
import { LegacyPlannerScreen } from "../screens/LegacyPlannerScreen";
import { NewProjectScreen } from "../screens/NewProjectScreen";
import { OutcomeCaptureScreen } from "../screens/OutcomeCaptureScreen";
import { PlanningRecordScreen } from "../screens/PlanningRecordScreen";
import { RecordLibraryScreen } from "../screens/RecordLibraryScreen";
import { SettingsDataScreen } from "../screens/SettingsDataScreen";
import type { AppRoute } from "./routes";
import { NEW_PROJECT_ROUTE, RECORD_LIBRARY_ROUTE } from "./routes";

export function AppShell() {
  const [route, setRoute] = useState<AppRoute>(RECORD_LIBRARY_ROUTE);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode, setMode } = usePresentationMode();

  const navigate = (nextRoute: AppRoute) => {
    setRoute(nextRoute);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navButtonClass = (active: boolean) =>
    `inline-flex items-center gap-2 rounded px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition ${
      active ? "bg-[#EDF3F2] text-[#4B7270]" : "text-[#6F6F6F] hover:bg-[#F8F7F2] hover:text-[#333333]"
    }`;

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#F8F7F2] font-sans text-[#333333]">
      <header className="sticky top-0 z-30 border-b border-[#E2E1DB] bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-6">
          <button type="button" onClick={() => navigate(RECORD_LIBRARY_ROUTE)} className="min-w-0 text-left group">
            <h1 className="text-2xl font-light tracking-tight text-[#4B7270] group-hover:text-[#3D5D5B]">PrintPal <span className="font-bold text-[#333333]">3D</span></h1>
            <p className="hidden text-[9px] uppercase tracking-widest text-[#8A8A8A] sm:block">Decision Memory • Precision Lab Edition</p>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            <button type="button" onClick={() => navigate(RECORD_LIBRARY_ROUTE)} className={navButtonClass(route.name === "RECORD_LIBRARY" || route.name === "ATTEMPT_DETAIL" || route.name === "PLANNING_RECORD" || route.name === "RECORD_OUTCOME" || route.name === "DUPLICATE_ATTEMPT" || route.name === "COMPARE_ATTEMPTS" || route.name === "COMPARISON_RECORD" || route.name === "DECISION_SUPPORT")}><Database className="h-4 w-4" /> Records</button>
            <button type="button" onClick={() => navigate(NEW_PROJECT_ROUTE)} className={navButtonClass(route.name === "NEW_PROJECT")}><FilePlus2 className="h-4 w-4" /> New Print</button>
            <button type="button" onClick={() => navigate({ name: "LEGACY_PLANNER" })} className={navButtonClass(route.name === "LEGACY_PLANNER")}><Sparkles className="h-4 w-4" /> Planner</button>
            <button type="button" onClick={() => navigate({ name: "MATERIAL_COMPASS" })} className={navButtonClass(route.name === "MATERIAL_COMPASS")}><Beaker className="h-4 w-4" /> Materials</button>
            <button type="button" onClick={() => navigate({ name: "FAILURE_REVIEW" })} className={navButtonClass(route.name === "FAILURE_REVIEW")}><AlertTriangle className="h-4 w-4" /> Failure Review</button>
            <button type="button" onClick={() => navigate({ name: "SETTINGS_DATA" })} className={navButtonClass(route.name === "SETTINGS_DATA")}><Settings className="h-4 w-4" /> Settings</button>
          </nav>

          <div className="hidden items-center gap-1 rounded border border-[#D6D4CC] bg-[#F8F7F2] p-1 md:flex">
            <button type="button" onClick={() => setMode("GUIDED")} className={`rounded px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition ${mode === "GUIDED" ? "bg-white text-[#4B7270] shadow-sm" : "text-[#8A8A8A]"}`}>Guided</button>
            <button type="button" onClick={() => setMode("TECHNICAL")} className={`rounded px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition ${mode === "TECHNICAL" ? "bg-white text-[#4B7270] shadow-sm" : "text-[#8A8A8A]"}`}>Technical</button>
          </div>

          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded border border-[#D6D4CC] text-[#4B7270] lg:hidden" aria-label="Toggle navigation menu">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#E2E1DB] bg-white px-4 py-4 lg:hidden">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => navigate(RECORD_LIBRARY_ROUTE)} className={navButtonClass(route.name === "RECORD_LIBRARY" || route.name === "ATTEMPT_DETAIL" || route.name === "PLANNING_RECORD" || route.name === "RECORD_OUTCOME" || route.name === "DUPLICATE_ATTEMPT" || route.name === "COMPARE_ATTEMPTS" || route.name === "COMPARISON_RECORD" || route.name === "DECISION_SUPPORT")}><Database className="h-4 w-4" /> Records</button>
              <button type="button" onClick={() => navigate(NEW_PROJECT_ROUTE)} className={navButtonClass(route.name === "NEW_PROJECT")}><FilePlus2 className="h-4 w-4" /> New Print</button>
              <button type="button" onClick={() => navigate({ name: "LEGACY_PLANNER" })} className={navButtonClass(route.name === "LEGACY_PLANNER")}><Sparkles className="h-4 w-4" /> Planner</button>
              <button type="button" onClick={() => navigate({ name: "MATERIAL_COMPASS" })} className={navButtonClass(route.name === "MATERIAL_COMPASS")}><Beaker className="h-4 w-4" /> Materials</button>
              <button type="button" onClick={() => navigate({ name: "FAILURE_REVIEW" })} className={navButtonClass(route.name === "FAILURE_REVIEW")}><AlertTriangle className="h-4 w-4" /> Failure Review</button>
              <button type="button" onClick={() => navigate({ name: "SETTINGS_DATA" })} className={navButtonClass(route.name === "SETTINGS_DATA")}><Settings className="h-4 w-4" /> Settings</button>
            </div>
            <div className="mt-4 flex items-center justify-between rounded border border-[#D6D4CC] bg-[#F8F7F2] p-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#8A8A8A]">Presentation Mode</span>
              <div className="flex gap-1">
                <button type="button" onClick={() => setMode("GUIDED")} className={`rounded px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${mode === "GUIDED" ? "bg-white text-[#4B7270] shadow-sm" : "text-[#8A8A8A]"}`}>Guided</button>
                <button type="button" onClick={() => setMode("TECHNICAL")} className={`rounded px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${mode === "TECHNICAL" ? "bg-white text-[#4B7270] shadow-sm" : "text-[#8A8A8A]"}`}>Technical</button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-4 py-5 md:px-6 md:py-6">
        {route.name === "RECORD_LIBRARY" && (
          <RecordLibraryScreen
            onNewProject={() => navigate(NEW_PROJECT_ROUTE)}
            onOpenProject={(projectId, attemptId) => navigate({ name: "ATTEMPT_DETAIL", projectId, attemptId })}
            onOpenPlanner={() => navigate({ name: "LEGACY_PLANNER" })}
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
            onOpenPlanner={() => navigate({ name: "LEGACY_PLANNER" })}
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
        {route.name === "LEGACY_PLANNER" && <LegacyPlannerScreen onBack={() => navigate(RECORD_LIBRARY_ROUTE)} />}
        {route.name === "MATERIAL_COMPASS" && <MaterialCompass onBack={() => navigate(RECORD_LIBRARY_ROUTE)} />}
        {route.name === "FAILURE_REVIEW" && <FailureReview onBack={() => navigate(RECORD_LIBRARY_ROUTE)} />}
      </main>

      <footer className="border-t border-[#E2E1DB] bg-white">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-2 px-4 py-4 text-[10px] leading-relaxed text-[#7A7974] md:flex-row md:items-center md:justify-between md:px-6">
          <span className="inline-flex items-center gap-2"><FlaskConical className="h-4 w-4 text-[#4B7270]" /> Records are stored locally in this browser. Export and recovery controls are available in Settings.</span>
          <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-[#4B7270]" /> Manufacturer documentation, TDS, SDS, and slicer guidance remain authoritative.</span>
        </div>
      </footer>
    </div>
  );
}
