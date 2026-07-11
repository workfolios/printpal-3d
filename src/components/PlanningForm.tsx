import React, { useState } from 'react';
import { PrintPlanningFormData } from '../types';

const PRINTER_TECH_OPTIONS = [
  "Bed Slinger FDM",
  "CoreXY / Enclosed FDM",
  "LCD Resin",
  "SLA Resin",
  "DLP Resin",
  "Unknown / Other"
];

const PRINT_PURPOSE_OPTIONS = [
  "Decorative",
  "Functional",
  "Prototype",
  "Repair / Replacement Part",
  "Miniature / Display",
  "Experiment",
  "Small Batch / Repeat Print"
];

const PRIORITY_OPTIONS = [
  "Strength",
  "Surface Finish",
  "Detail",
  "Speed",
  "Dimensional Accuracy",
  "Reliability",
  "Cost Control",
  "Learning / Experimentation"
];

const CONCERN_OPTIONS = [
  "Warping",
  "Bed Adhesion",
  "Supports",
  "Brittleness",
  "Moisture / Material Condition",
  "Resin Handling",
  "Wash / Cure Process",
  "Dimensional Fit",
  "Surface Finish",
  "Unknown Settings",
  "Repeatability"
];

const inputStyles = "w-full border border-[#E2E1DB] rounded px-2 py-1.5 text-sm bg-white focus:outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]";
const selectStyles = "w-full border border-[#E2E1DB] rounded px-1 py-1 text-xs bg-white focus:outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]";
const labelStyles = "text-[10px] uppercase font-bold text-[#8a8a8a] block mb-1";

interface PlanningFormProps {
  initialData: PrintPlanningFormData;
  onSubmit: (data: PrintPlanningFormData) => void;
  isLoading: boolean;
}

export function PlanningForm({ initialData, onSubmit, isLoading }: PlanningFormProps) {
  const [formData, setFormData] = React.useState<PrintPlanningFormData>(initialData);
  const [isTechnicalMode, setIsTechnicalMode] = React.useState(false);

  React.useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (concern: string) => {
    setFormData(prev => {
      const isSelected = prev.concerns.includes(concern);
      return {
        ...prev,
        concerns: isSelected
          ? prev.concerns.filter(c => c !== concern)
          : [...prev.concerns, concern]
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex justify-center items-center py-3 bg-[#F8F7F2] border-b border-[#E2E1DB]">
        <div className="flex bg-white rounded-full border border-[#E2E1DB] p-1 text-[10px] font-bold uppercase tracking-wider">
          <button
            type="button"
            className={`px-3 py-1 rounded-full ${!isTechnicalMode ? 'bg-[#4B7270] text-white' : 'text-[#8A8A8A] hover:bg-[#F8F7F2]'}`}
            onClick={() => setIsTechnicalMode(false)}
          >
            Guided
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded-full ${isTechnicalMode ? 'bg-[#4B7270] text-white' : 'text-[#8A8A8A] hover:bg-[#F8F7F2]'}`}
            onClick={() => setIsTechnicalMode(true)}
          >
            Technical
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        <div className="space-y-1">
          <label htmlFor="projectName" className={labelStyles}>
            {isTechnicalMode ? 'Project / Run ID' : 'Project Name'}
          </label>
          <input
            required
            type="text"
            id="projectName"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            className={inputStyles}
            placeholder={isTechnicalMode ? "e.g. TST-551 Bracket" : "e.g. Desk Cable Clip"}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="printGoal" className={labelStyles}>
            {isTechnicalMode ? 'Object Details & Assumptions' : 'Print Intent'}
          </label>
          <textarea
            required
            id="printGoal"
            name="printGoal"
            value={formData.printGoal}
            onChange={handleChange}
            className="w-full border border-[#E2E1DB] rounded px-2 py-1 text-sm h-12 resize-none bg-white focus:outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
            placeholder={isTechnicalMode ? "Describe object dimensions, assumed load, and physical clearances..." : "Describe the object and its context..."}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="printerTech" className={labelStyles}>Technology</label>
            <select
               required
               id="printerTech"
               name="printerTech"
               value={formData.printerTech}
               onChange={handleChange}
               className={selectStyles}
               disabled={isLoading}
             >
               <option value="" disabled>Select</option>
               {PRINTER_TECH_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          </div>
          <div>
            <label htmlFor="purpose" className={labelStyles}>Purpose</label>
            <select
               required
               id="purpose"
               name="purpose"
               value={formData.purpose}
               onChange={handleChange}
               className={selectStyles}
               disabled={isLoading}
             >
               <option value="" disabled>Select</option>
               {PRINT_PURPOSE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="material" className={labelStyles}>Material & Priority</label>
          <div className="flex gap-2">
             <input
               required
               type="text"
               id="material"
               name="material"
               value={formData.material}
               onChange={handleChange}
               className="flex-1 border border-[#E2E1DB] rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
               placeholder={isTechnicalMode ? "e.g. Polymaker PETG" : "e.g. PETG"}
               disabled={isLoading}
             />
             <select
               required
               id="priority"
               name="priority"
               value={formData.priority}
               onChange={handleChange}
               className="w-full border border-[#E2E1DB] rounded px-1 py-1 text-xs bg-white focus:outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
               disabled={isLoading}
             >
               <option value="" disabled>Priority</option>
               {PRIORITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="printerName" className={labelStyles}>
            {isTechnicalMode ? 'Hardware Config' : 'Printer (Optional)'}
          </label>
          <input
            type="text"
            id="printerName"
            name="printerName"
            value={formData.printerName}
            onChange={handleChange}
            className={inputStyles}
            placeholder={isTechnicalMode ? "e.g. Voron 2.4 350mm / 0.4mm Nozzle" : "e.g. Prusa MK4"}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className={labelStyles}>
            {isTechnicalMode ? 'Risk Vectors' : 'Known Concerns'}
          </label>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            {CONCERN_OPTIONS.map(concern => (
              <label key={concern} className="flex items-center gap-1 cursor-pointer group text-[#333333]">
                <input
                  type="checkbox"
                  className="rounded border-[#E2E1DB] text-[#4B7270] focus:ring-[#4B7270]"
                  checked={formData.concerns.includes(concern)}
                  onChange={() => handleCheckboxChange(concern)}
                  disabled={isLoading}
                />
                {concern}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="notes" className={labelStyles}>
            {isTechnicalMode ? 'Doc Requirements & Pre-Checks' : 'Additional Notes'} <span className="font-normal">(Optional)</span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
             className="w-full border border-[#E2E1DB] rounded px-2 py-1 text-sm h-12 resize-none bg-white focus:outline-none focus:border-[#4B7270] focus:ring-1 focus:ring-[#4B7270]"
            placeholder={isTechnicalMode ? "TDS verified? Ambient temp recorded?..." : "Any other details..."}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="p-4 pt-0">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#4B7270] hover:bg-[#3d5d5b] text-white font-bold py-3 rounded uppercase text-xs tracking-widest shadow-lg disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
        >
          {isLoading ? "Generating..." : "Generate Planning Card"}
        </button>
      </div>
    </form>
  );
}
