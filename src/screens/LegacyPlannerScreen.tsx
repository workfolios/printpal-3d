import { useState } from "react";
import { PlanningForm } from "../components/PlanningForm";
import { ResultCard } from "../components/ResultCard";
import { requestPlanningEnvelope } from "../services/planningService";
import type { PrintPlanningCard, PrintPlanningEnvelope, PrintPlanningFormData } from "../types";

const EMPTY_FORM: PrintPlanningFormData = {
  projectName: "",
  printGoal: "",
  printerTech: "",
  printerName: "",
  material: "",
  purpose: "",
  priority: "",
  concerns: [],
  notes: "",
};

const STARTERS: Array<{ label: string; data: PrintPlanningFormData }> = [
  {
    label: "PETG Desk Cable Clip",
    data: {
      projectName: "Desk Cable Clip",
      printGoal: "A batch of 5 clips that attach underneath a wooden desk to hold thick power cables.",
      printerTech: "Bed Slinger FDM",
      printerName: "",
      material: "PETG",
      purpose: "Functional",
      priority: "Strength",
      concerns: ["Bed Adhesion", "Brittleness"],
      notes: "Need these to have a bit of flex so the cable snaps in, but strong enough not to break when tugged.",
    },
  },
  {
    label: "Resin Display Miniature",
    data: {
      projectName: "D&D Dragon Miniature",
      printGoal: "A highly detailed dragon model for an upcoming tabletop game session. Very fine scales and teeth.",
      printerTech: "LCD Resin",
      printerName: "",
      material: "Standard Grey Resin",
      purpose: "Miniature / Display",
      priority: "Detail",
      concerns: ["Supports", "Wash / Cure Process", "Resin Handling"],
      notes: "Hollowed to save resin, added drain holes. Not sure how long to cure.",
    },
  },
  {
    label: "PLA Drawer Organizer",
    data: {
      projectName: "Kitchen Drawer Hex Organizers",
      printGoal: "A modular, snap-together set of hexagonal cups to organize messy kitchen drawers.",
      printerTech: "CoreXY / Enclosed FDM",
      printerName: "",
      material: "PLA",
      purpose: "Functional",
      priority: "Dimensional Accuracy",
      concerns: ["Dimensional Fit", "Warping"],
      notes: "",
    },
  },
];

interface LegacyPlannerScreenProps {
  onBack: () => void;
}

export function LegacyPlannerScreen({ onBack }: LegacyPlannerScreenProps) {
  const [formData, setFormData] = useState<PrintPlanningFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PrintPlanningCard | null>(null);
  const [envelope, setEnvelope] = useState<PrintPlanningEnvelope | null>(null);

  const handleSubmit = async (data: PrintPlanningFormData) => {
    setFormData(data);
    setIsLoading(true);
    setResult(null);

    try {
      const nextEnvelope = await requestPlanningEnvelope(data);
      setEnvelope(nextEnvelope);
      setResult(nextEnvelope.data);
    } finally {
      setIsLoading(false);
      window.setTimeout(() => {
        document.getElementById("result-section")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <section className="flex min-h-0 w-full flex-1 flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-lg border border-[#E2E1DB] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B7270]">Standalone Reference Tool</p>
          <h1 className="mt-1 text-xl font-bold text-[#333333]">Print Planner</h1>
          <p className="mt-1 text-xs text-[#6F6F6F]">Use this standalone planner for an unsaved planning draft. Open a saved Attempt to create or edit its persistent Plan record.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STARTERS.map((starter) => (
            <button key={starter.label} type="button" onClick={() => setFormData(starter.data)} disabled={isLoading} className="rounded-full border border-[#E2E1DB] bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#6F6F6F] hover:border-[#4B7270]">{starter.label}</button>
          ))}
          <button type="button" onClick={onBack} className="rounded border border-[#4B7270] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#4B7270] hover:bg-[#EDF3F2]">Back To Reference Tools</button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 lg:flex-row">
        <aside className="h-auto w-full shrink-0 overflow-hidden rounded-lg border border-[#E2E1DB] bg-white shadow-sm lg:h-full lg:w-[360px]">
          <div className="bg-[#4B7270] p-4 text-xs font-bold uppercase tracking-wider text-white">Print Configuration</div>
          <div className="h-auto w-full lg:h-[calc(100%-48px)] lg:overflow-y-auto">
            <PlanningForm initialData={formData} onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </aside>

        <div id="result-section" className="flex min-h-[320px] w-full flex-1 flex-col overflow-hidden rounded-lg border border-[#E2E1DB] bg-white shadow-md lg:min-h-0">
          {isLoading ? (
            <div className="flex flex-1 flex-col p-6">
              <div className="animate-pulse space-y-6">
                <div className="h-12 rounded bg-[#E2E1DB]/40" />
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="h-56 rounded bg-[#E2E1DB]/30" />
                  <div className="h-56 rounded bg-[#E2E1DB]/30" />
                </div>
              </div>
              <span className="mt-8 text-center text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Generating structured planning card…</span>
            </div>
          ) : result ? (
            <div className="h-auto flex-1 lg:h-full lg:overflow-hidden"><ResultCard card={result} formData={formData} envelope={envelope} /></div>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-[10px] font-bold uppercase tracking-widest text-[#8A8A8A]">Adjust the formulation, then generate a planning card.</div>
          )}
        </div>
      </div>
    </section>
  );
}
