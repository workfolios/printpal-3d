import { AlertTriangle, ArrowRight, Beaker, BookOpen, ShieldCheck, Sparkles } from "lucide-react";

interface ReferenceToolsScreenProps {
  onOpenPlanner: () => void;
  onOpenMaterials: () => void;
  onOpenFailureReview: () => void;
}

const tools = [
  {
    title: "Quick Planner",
    description: "Use the original planning-card workflow for a fast, non-persistent advisory draft.",
    icon: Sparkles,
    actionLabel: "Open Quick Planner",
    key: "planner",
  },
  {
    title: "Materials Compass",
    description: "Review material questions, source checks, and documentation prompts outside a saved Project.",
    icon: Beaker,
    actionLabel: "Open Materials Compass",
    key: "materials",
  },
  {
    title: "Failure Review",
    description: "Create a non-diagnostic checklist for documenting a print issue before changing variables.",
    icon: AlertTriangle,
    actionLabel: "Open Failure Review",
    key: "failure",
  },
] as const;

export function ReferenceToolsScreen({
  onOpenPlanner,
  onOpenMaterials,
  onOpenFailureReview,
}: ReferenceToolsScreenProps) {
  const handlers = {
    planner: onOpenPlanner,
    materials: onOpenMaterials,
    failure: onOpenFailureReview,
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <header className="rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 h-6 w-6 shrink-0 text-[#4B7270]" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4B7270]">Reference Tools</p>
            <h1 className="mt-2 text-2xl font-light tracking-tight text-[#333333] md:text-3xl">Standalone advisory utilities</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#6F6F6F]">
              These V0.3.1 utilities remain available for quick reference, but they do not write to the persistent V0.4 decision-memory record. Use the Project workflow when the result should be retained, compared, exported, or restored.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <article key={tool.key} className="flex min-h-64 flex-col rounded-lg border border-[#E2E1DB] bg-white p-5 shadow-sm md:p-6">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-[#EDF3F2] text-[#4B7270]">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 text-lg font-semibold text-[#333333]">{tool.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[#6F6F6F]">{tool.description}</p>
              <button
                type="button"
                onClick={handlers[tool.key]}
                className="mt-5 inline-flex items-center justify-center gap-2 rounded border border-[#4B7270] px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#4B7270] transition hover:bg-[#EDF3F2]"
              >
                {tool.actionLabel} <ArrowRight className="h-4 w-4" />
              </button>
            </article>
          );
        })}
      </div>

      <section className="flex items-start gap-3 rounded-lg border border-[#D7E3E1] bg-[#F7FAF9] p-5 text-[#3D5D5B] md:p-6">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="text-sm font-semibold">Advisory Boundary</h2>
          <p className="mt-1 text-xs leading-6">
            Reference-tool output is not a diagnosis, certification, or universal settings authority. Manufacturer manuals, slicer documentation, verified profiles, Technical Data Sheets, Safety Data Sheets, technical validation, and user judgment remain authoritative.
          </p>
        </div>
      </section>
    </section>
  );
}
