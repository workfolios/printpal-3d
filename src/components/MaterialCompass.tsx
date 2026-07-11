import React from 'react';
import { MaterialCompassFormData, MaterialCompassCard } from '../types';

interface Props {
  onBack: () => void;
}

export function MaterialCompass({ onBack }: Props) {
  const [formData, setFormData] = React.useState<MaterialCompassFormData>({
    material: '',
    purpose: '',
    property: '',
    concerns: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<MaterialCompassCard | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-material-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Server error');
      setResult(await response.json());
    } catch (err: any) {
      // rudimentary fallback
      setResult({
        questionsToVerify: ["Is your environment suitable?", "Have you checked ventilation requirements?"],
        sourceDocsToCheck: ["Material Technical Data Sheet (TDS)", "Safety Data Sheet (SDS)"],
        materialBehavior: ["Review manufacturer guidance for warp, shrinkage, and adhesion."],
        documentationPrompts: ["Record ambient temperature.", "Note any odor or fumes."]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-lg shadow-sm border border-[#E2E1DB]">
      <div className="p-4 bg-[#4B7270] text-white flex justify-between items-center rounded-t-lg shrink-0">
        <h2 className="text-xs font-bold uppercase tracking-wider">Materials Compass</h2>
        <button type="button" onClick={onBack} className="text-[10px] uppercase font-bold border border-white/30 px-3 py-1 rounded hover:bg-white/10 transition-colors">
          Back to Dashboard
        </button>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 border-r border-[#E2E1DB] p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">What material or resin are you considering?</label>
              <input required name="material" value={formData.material} onChange={handleChange} placeholder="e.g. ABS, Tough Resin..." className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">What is the print purpose?</label>
              <input required name="purpose" value={formData.purpose} onChange={handleChange} placeholder="e.g. Outdoor mounting bracket" className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">What property matters most?</label>
              <input required name="property" value={formData.property} onChange={handleChange} placeholder="e.g. UV Resistance, Impact strength" className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-[#8A8A8A] mb-1">Any environmental or safety concerns?</label>
              <textarea name="concerns" value={formData.concerns} onChange={handleChange} rows={3} placeholder="e.g. Will be in direct sunlight, printing in bedroom..." className="w-full text-xs p-2.5 border border-[#E2E1DB] rounded focus:ring-1 focus:ring-[#4B7270] outline-none resize-none" />
            </div>
            
            <button disabled={isLoading} type="submit" className="w-full bg-[#4B7270] text-white py-3 rounded text-[10px] uppercase font-bold tracking-widest hover:bg-[#3D5D5B] transition-colors disabled:opacity-50">
              {isLoading ? 'Advising...' : 'Get Material Context'}
            </button>
          </form>
        </div>
        
        <div className="w-full lg:w-2/3 p-6 overflow-y-auto bg-[#F8F7F2]">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-[10px] uppercase text-[#8A8A8A] tracking-widest animate-pulse">Generating advisory context...</div>
          ) : result ? (
            <div className="space-y-6 text-[#333333]">
              <h3 className="text-sm font-bold uppercase mb-4 border-b border-[#E2E1DB] pb-2">Material Context: {formData.material}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-2">Questions To Verify</h4>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    {result.questionsToVerify.map((q, i) => <li key={i}>{q}</li>)}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-2">Source Docs To Check</h4>
                  <ul className="list-disc ml-4 space-y-1 text-xs">
                    {result.sourceDocsToCheck.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-2">Material Behavior Considerations</h4>
                <ul className="list-disc ml-4 space-y-1 text-xs">
                  {result.materialBehavior.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              
              <div>
                <h4 className="text-[10px] font-bold text-[#4B7270] uppercase tracking-wider mb-2">Documentation Prompts</h4>
                <ul className="list-disc ml-4 space-y-1 text-xs">
                  {result.documentationPrompts.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>

              <div className="bg-[#FFFCF0] border border-[#F5EAD2] p-3 rounded text-[9px] leading-tight text-[#7D6B45] mt-6">
                 <p><strong>SAFETY NOTE:</strong> PrintPal 3D is a planning and documentation aid only. Always verify printer settings, material handling, post-processing, ventilation, and safety practices against your printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets.</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-full text-[10px] uppercase text-[#8A8A8A] tracking-widest text-center max-w-sm mx-auto">
              Provide context on the left to generate material handling and safety recommendations according to manufacturer baselines.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
