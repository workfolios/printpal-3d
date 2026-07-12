import React from "react";
import { Check, Copy } from "lucide-react";
import type { PlanContent } from "../domain/types";
import type { PrintPlanningEnvelope, PrintPlanningFormData } from "../types";

interface ResultCardProps {
  card: PlanContent;
  formData: PrintPlanningFormData;
  envelope?: PrintPlanningEnvelope | null;
}

const ORIGIN_LABELS: Record<NonNullable<PrintPlanningEnvelope>["origin"], string> = {
  AI_ASSISTED: "AI-Assisted",
  RULES_BASED_FALLBACK: "Rules-Based Fallback",
  USER_AUTHORED: "User-Authored",
  AI_ASSISTED_USER_EDITED: "AI-Assisted · User Edited",
};

function ListSection({ title, items, number }: { title: string; items: string[]; number: string }) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4B7270]"><span className="font-mono">{number}.</span> {title}</h3>
      {items.length > 0 ? (
        <ul className="ml-4 list-disc space-y-1.5 text-xs leading-relaxed text-[#333333]">
          {items.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
        </ul>
      ) : (
        <p className="text-xs italic text-[#8A8A8A]">None recorded.</p>
      )}
    </section>
  );
}

export function ResultCard({ card, formData, envelope }: ResultCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    const textToCopy = `
PrintPal 3D - Planning View
Project: ${formData.projectName || "Untitled"}
Origin: ${envelope ? ORIGIN_LABELS[envelope.origin] : "Not recorded"}
Prompt Version: ${envelope?.promptVersion || "Not applicable"}
Rules Version: ${envelope?.rulesVersion || "Not applicable"}

1. Objective Summary
${card.objectiveSummary}

2. Readiness Considerations
${card.readinessConsiderations.map((item) => `- ${item}`).join("\n")}

3. Printer Watch-Outs
${card.printerWatchOuts.map((item) => `- ${item}`).join("\n")}

4. Material Watch-Outs
${card.materialWatchOuts.map((item) => `- ${item}`).join("\n")}

5. Assumptions
${card.assumptions.map((item) => `- ${item}`).join("\n")}

6. Missing Information
${card.missingInformation.map((item) => `- ${item}`).join("\n")}

7. Source Checks
${card.sourceChecks.map((item) => `- ${item}`).join("\n")}

8. Variables To Record
${card.variablesToRecord.map((item) => `- ${item}`).join("\n")}

9. Expected Outcome Criteria
${card.expectedOutcomeCriteria.map((item) => `- ${item}`).join("\n")}

PrintPal 3D is a planning and documentation aid only. Verify printer settings, material handling, post-processing, ventilation, and safety practices against the applicable printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets.
    `.trim();

    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <header className="flex shrink-0 flex-col gap-3 border-b border-[#E2E1DB] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#4B7270]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#333333]">Print Planning View</h2>
          {envelope && <span className="rounded-full border border-[#C9DAD7] bg-[#F1F7F6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#4B7270]">{ORIGIN_LABELS[envelope.origin]}</span>}
        </div>
        <button type="button" onClick={handleCopy} className="inline-flex items-center justify-center gap-2 rounded border border-[#E2E1DB] px-3 py-2 text-[10px] font-bold uppercase text-[#333333] hover:bg-[#F8F7F2]">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy Planning Text"}
        </button>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto p-5 text-xs leading-relaxed text-[#333333] md:p-6">
        {envelope && envelope.warnings.length > 0 && (
          <div className="rounded border border-[#E9D9B7] bg-[#FFFCF0] p-4 text-xs leading-relaxed text-[#7D6B45]" role="status">
            <strong className="mb-1 block uppercase tracking-wider">Generation Notice</strong>
            {envelope.warnings.map((warning) => <p key={warning}>{warning}</p>)}
          </div>
        )}

        <section>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4B7270]"><span className="font-mono">01.</span> Objective Summary</h3>
          <p className="text-sm leading-relaxed">{card.objectiveSummary}</p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ListSection number="02" title="Readiness Considerations" items={card.readinessConsiderations} />
            <ListSection number="03" title="Printer Watch-Outs" items={card.printerWatchOuts} />
            <ListSection number="04" title="Material Watch-Outs" items={card.materialWatchOuts} />
            <ListSection number="05" title="Assumptions" items={card.assumptions} />
          </div>
          <div className="space-y-6">
            <ListSection number="06" title="Missing Information" items={card.missingInformation} />
            <ListSection number="07" title="Source Checks" items={card.sourceChecks} />
            <ListSection number="08" title="Variables To Record" items={card.variablesToRecord} />
            <ListSection number="09" title="Expected Outcome Criteria" items={card.expectedOutcomeCriteria} />
          </div>
        </div>

        <div className="rounded border border-[#F5EAD2] bg-[#FFFCF0] p-3 text-[9px] leading-relaxed text-[#7D6B45]">
          <strong>SAFETY NOTE:</strong> PrintPal 3D is a planning and documentation aid only. Verify printer settings, material handling, post-processing, ventilation, and safety practices against the applicable printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets.
        </div>

        {envelope && (
          <dl className="grid grid-cols-1 gap-3 border-t border-[#E2E1DB] pt-4 text-[9px] text-[#8A8A8A] sm:grid-cols-3">
            <div><dt className="font-bold uppercase tracking-widest">Generated</dt><dd className="mt-1">{new Date(envelope.generatedAt).toLocaleString()}</dd></div>
            <div><dt className="font-bold uppercase tracking-widest">Prompt</dt><dd className="mt-1">{envelope.promptVersion || "Not applicable"}</dd></div>
            <div><dt className="font-bold uppercase tracking-widest">Rules</dt><dd className="mt-1">{envelope.rulesVersion || "Not applicable"}</dd></div>
          </dl>
        )}
      </div>
    </div>
  );
}
