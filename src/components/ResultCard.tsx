import React from 'react';
import { PrintPlanningCard, PrintPlanningFormData } from '../types';
import { Copy, Check, Info, AlertTriangle, ListChecks, Wrench, Bookmark, Lightbulb } from 'lucide-react';

interface ResultCardProps {
  card: PrintPlanningCard;
  formData: PrintPlanningFormData;
}

export function ResultCard({ card, formData }: ResultCardProps) {
  const [copied, setCopied] = React.useState(false);
  const [labNoteCopied, setLabNoteCopied] = React.useState(false);

  const handleCopy = () => {
    const textToCopy = `
PrintPal 3D - Planning Card

--- 1. Quick Read ---
${card.quickRead}

--- 2. Printer Technology Considerations ---
${card.printerTechConsiderations}

--- 3. Material / Resin Watch-Outs ---
${card.materialWatchOuts}

--- 4. Risk Flags ---
${card.riskFlags.map(r => '- ' + r).join('\n')}

--- 5. Pre-Print Readiness Checklist ---
${card.readinessChecklist.map(r => '- ' + r).join('\n')}

--- 6. Post-Print / Finishing Notes ---
${card.postPrintNotes.map(r => '- ' + r).join('\n')}

--- 7. What To Document For Next Time ---
${card.whatToDocument.map(r => '- ' + r).join('\n')}

--- 8. Assumptions And Gaps ---
${card.assumptionsAndGaps.map(r => '- ' + r).join('\n')}

--- 9. Friendly Note ---
${card.friendlyNote}

**
PrintPal 3D is a planning and documentation aid only. Always verify printer settings, material handling, post-processing, ventilation, and safety practices against your printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets.
**
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCopyLabNote = () => {
    const textToCopy = `
LAB NOTE - ${formData.projectName || 'Untitled'}
Date: [   ]

Settings:
- Tech: ${formData.printerTech}
- Printer: ${formData.printerName || 'Unspecified'}
- Material: ${formData.material}
- Purpose: ${formData.purpose}
- Priority: ${formData.priority}
- Known Concerns: ${formData.concerns.length ? formData.concerns.join(', ') : 'None'}

Assumptions to Verify (PrintPal):
${card.assumptionsAndGaps.map(g => '- ' + g).join('\n')}

To Document Post-Print (PrintPal):
${card.whatToDocument.map(d => '- ' + d).join('\n')}

Outcome Notes:
[   ]

Next Test Refinements:
[   ]
    `.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setLabNoteCopied(true);
      setTimeout(() => setLabNoteCopied(false), 2000);
    });
  };

  const SectionHeading = ({ children, num }: { children: React.ReactNode, num: string }) => (
    <h3 className="text-xs font-bold text-[#4B7270] uppercase tracking-wider mb-2">
      <span className="font-mono">{num}.</span> {children}
    </h3>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="p-4 border-b border-[#E2E1DB] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#4B7270]"></div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#333333]">Print Planning Card</h2>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-[10px] border border-[#E2E1DB] px-3 py-1.5 rounded flex items-center gap-1 hover:bg-[#F8F7F2] focus:outline-none focus:ring-1 focus:ring-[#4B7270] focus:border-[#4B7270] font-bold uppercase text-[#333333]"
        >
          {copied ? 'Copied' : 'Copy Card Text'}
        </button>
      </div>
      
      <div className="flex-1 p-6 space-y-6 text-xs leading-relaxed overflow-y-auto w-full text-[#333333] flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <SectionHeading num="01">Quick Read</SectionHeading>
              <p>{card.quickRead}</p>
            </div>
            
            <div>
              <SectionHeading num="02">Technology Considerations</SectionHeading>
              <p>{card.printerTechConsiderations}</p>
            </div>
            
            <div>
              <SectionHeading num="03">Material Watch-Outs</SectionHeading>
              <p>{card.materialWatchOuts}</p>
            </div>
            
            <div>
              <SectionHeading num="04">Risk Flags</SectionHeading>
              <ul className="list-disc ml-4 space-y-1 italic">
                {card.riskFlags.map((val, idx) => <li key={idx}>{val}</li>)}
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <SectionHeading num="05">Readiness Checklist</SectionHeading>
              <div className="space-y-1">
                {card.readinessChecklist.map((val, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <input type="checkbox" className="rounded border-[#E2E1DB] text-[#4B7270] focus:ring-[#4B7270] mt-0.5" />
                    <span>{val}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <SectionHeading num="06">Post-Print / Finishing</SectionHeading>
              <ul className="list-disc ml-4 space-y-1">
                {card.postPrintNotes.map((val, idx) => <li key={idx}>{val}</li>)}
              </ul>
            </div>
            
            <div>
              <SectionHeading num="07">To Document</SectionHeading>
              <ul className="list-disc ml-4 space-y-1">
                {card.whatToDocument.map((val, idx) => <li key={idx}>{val}</li>)}
              </ul>
            </div>
            
            <div>
              <SectionHeading num="08">Assumptions & Gaps</SectionHeading>
              <ul className="list-disc ml-4 space-y-1">
                {card.assumptionsAndGaps.map((val, idx) => <li key={idx}>{val}</li>)}
              </ul>
            </div>

            <div>
              <SectionHeading num="09">Friendly Note</SectionHeading>
              <p className="italic">{card.friendlyNote}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 mb-4 border border-[#E2E1DB] rounded p-4 bg-[#F8F7F2]">
           <div className="flex justify-between items-center mb-3">
             <h3 className="text-xs font-bold text-[#333333] uppercase">Export to Lab Note</h3>
             <button
                type="button"
                onClick={handleCopyLabNote}
                className="text-[10px] border border-[#E2E1DB] px-3 py-1.5 rounded flex items-center gap-1 bg-white hover:bg-[#F0EEE6] focus:outline-none focus:ring-1 focus:ring-[#4B7270] focus:border-[#4B7270] font-bold uppercase text-[#333333]"
              >
                {labNoteCopied ? 'Copied to Clipboard' : 'Copy Lab Note'}
              </button>
           </div>
           <p className="text-[#8A8A8A] text-[10px]">Generates a plain-text markdown block for your physical or digital lab notebook, pre-filled with this session's configuration and gaps.</p>
        </div>
        
        <div className="pt-4 border-t border-[#E2E1DB] flex flex-col gap-2 mt-auto">
          <div className="bg-[#FFFCF0] border border-[#F5EAD2] p-3 rounded text-[9px] leading-tight text-[#7D6B45]">
            <p><strong>SAFETY NOTE:</strong> PrintPal 3D is a planning and documentation aid only. Always verify printer settings, material handling, post-processing, ventilation, and safety practices against your printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets.</p>
          </div>
          <div className="flex justify-between items-end mt-2">
            <div className="text-[10px] italic text-[#8A8A8A]">"Planning is the first layer of every successful print."</div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase text-[#4B7270]">Planning Utility</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
