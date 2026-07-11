import React from 'react';
import { FailureReviewFormData, FailureReviewCard } from '../types';

interface Props {
  onBack: () => void;
}

export function FailureReview({ onBack }: Props) {
  const [formData, setFormData] = React.useState<FailureReviewFormData>({
    whatHappened: '',
    printerTech: '',
    material: '',
    whenAppeared: '',
    whatChanged: '',
    photosAvailable: 'No',
    whatTried: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<FailureReviewCard | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-failure-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Server error');
      setResult(await response.json());
    } catch (err: any) {
      // fallback
      setResult({
        likelyAreasToCheck: ["Hardware configuration", "Slicer settings", "Material condition"],
        missingContext: ["Specific slicer values used", "Exact environmental conditions"],
        nextSafeDocumentationStep: "Document all current machine and slicer settings before making any changes.",
        sourceCheckReminder: "Check your printer's manual and material's TDS for standard baselines."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-lg shadow-sm border border-[#E2E1DB]">
      <div className="p-4 bg-[#4B7270] text-white flex justify-between items-center rounded-t-lg shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-wider">Failure Review Starter</h2>
        <button type="button" onClick={onBack} className="text-[10px] uppercase font-bold border border-white/30 px-3 py-1 rounded hover:bg-white/10 transition-colors">
          Back to Dashboard
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 border-r border-[#E2E1DB] p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">What happened?</label>
              <textarea required name="whatHappened" value={formData.whatHappened} onChange={handleChange} rows={2} placeholder="e.g. Print detached from bed halfway through..." className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">Printer Tech</label>
                <select required name="printerTech" value={formData.printerTech} onChange={handleChange} className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none bg-white">
                  <option value="" disabled>Select...</option>
                  <option value="Bed Slinger FDM">Bed Slinger FDM</option>
                  <option value="CoreXY / Enclosed FDM">CoreXY FDM</option>
                  <option value="LCD Resin">LCD Resin</option>
                  <option value="SLA Resin">SLA Resin</option>
                  <option value="Unknown">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">Material</label>
                <input required name="material" value={formData.material} onChange={handleChange} className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">When did the issue appear?</label>
              <input required name="whenAppeared" value={formData.whenAppeared} onChange={handleChange} placeholder="e.g. First layer, after 5 hours..." className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">What changed since last success?</label>
              <input required name="whatChanged" value={formData.whatChanged} onChange={handleChange} placeholder="e.g. New spool, changed nozzle, room is colder..." className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">What have you already tried?</label>
              <textarea required name="whatTried" value={formData.whatTried} onChange={handleChange} rows={2} placeholder="e.g. Leveled bed, applied glue..." className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none resize-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">Photos Available (For your reference)?</label>
              <select required name="photosAvailable" value={formData.photosAvailable} onChange={handleChange} className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none bg-white">
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            
            <button disabled={isLoading} type="submit" className="w-full bg-[#4B7270] text-white py-3 rounded text-[10px] uppercase font-bold tracking-widest hover:bg-[#3D5D5B] transition-colors disabled:opacity-50 mt-4">
              {isLoading ? 'Structuring Review...' : 'Generate Review Frame'}
            </button>
          </form>
        </div>
        
        <div className="w-full lg:w-2/3 p-6 overflow-y-auto bg-[#F8F7F2]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-[10px] uppercase text-[#8A8A8A] tracking-widest animate-pulse">Building troubleshooting frame...</div>
          ) : result ? (
            <div className="space-y-6 text-[#333333] max-w-2xl mx-auto">
              <h3 className="text-sm font-bold uppercase mb-4 border-b border-[#E2E1DB] pb-2">Troubleshooting Frame</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-2">Likely Areas To Check</h4>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    {result.likelyAreasToCheck.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-2">Missing Context</h4>
                  <ul className="list-disc ml-4 space-y-1 text-xs text-[#8A8A8A] italic">
                    {result.missingContext.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>

                <div className="bg-white border border-[#E2E1DB] p-4 rounded text-xs">
                  <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-1">Next Safe Documentation Step</h4>
                  <p>{result.nextSafeDocumentationStep}</p>
                </div>

                <div className="bg-white border border-[#E2E1DB] p-4 rounded text-xs">
                  <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-1">Source Check Reminder</h4>
                  <p>{result.sourceCheckReminder}</p>
                </div>
              </div>

              <div className="bg-[#FFFCF0] border border-[#F5EAD2] p-3 rounded text-[9px] leading-tight text-[#7D6B45] mt-6">
                 <p><strong>SAFETY NOTE:</strong> PrintPal 3D is a planning and documentation aid only. Always verify printer settings, material handling, post-processing, ventilation, and safety practices against your printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[10px] uppercase text-[#8A8A8A] tracking-widest text-center max-w-sm mx-auto space-y-4">
              <p>Capture the context of your failure to generate a structured troubleshooting frame.</p>
              <p className="text-[8px] p-2 bg-[#E2E1DB] rounded text-[#333333] opacity-60">Visual diagnosis is not supported in this prototype.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
