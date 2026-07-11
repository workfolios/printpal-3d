import React, { useState } from 'react';
import { PrintPlanningFormData, PrintPlanningCard } from './types';
import { PlanningForm } from './components/PlanningForm';
import { ResultCard } from './components/ResultCard';
import { generateClientFallbackCard } from './fallback';
import { FailureReview } from './components/FailureReview';
import { MaterialCompass } from './components/MaterialCompass';
import { Beaker, BookOpen, AlertTriangle, PlayCircle, Settings, Box, Compass, Database, Wrench } from 'lucide-react';

const EMPTY_FORM: PrintPlanningFormData = {
  projectName: '',
  printGoal: '',
  printerTech: '',
  printerName: '',
  material: '',
  purpose: '',
  priority: '',
  concerns: [],
  notes: ''
};

const STARTERS = [
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
      notes: "Need these to have a bit of flex so the cable snaps in, but strong enough not to break when tugged."
    }
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
      notes: "Hollowed to save resin, added drain holes. Not sure how long to cure."
    }
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
      notes: ""
    }
  }
];

type AppMode = 'DASHBOARD' | 'PLANNER' | 'FAILURE_REVIEW' | 'MATERIAL_COMPASS';

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>('DASHBOARD');
  
  // Planner State
  const [formData, setFormData] = useState<PrintPlanningFormData>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PrintPlanningCard | null>(null);

  const handleStartPlannerWithStarter = (data: PrintPlanningFormData) => {
    setFormData(data);
    setAppMode('PLANNER');
  };

  const handleStartPlannerEmpty = () => {
    setFormData(EMPTY_FORM);
    setAppMode('PLANNER');
  }

  const handleSubmit = async (data: PrintPlanningFormData) => {
    setFormData(data);
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const generatedCard = await response.json();
      setResult(generatedCard);
      
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err: any) {
      setResult(generateClientFallbackCard(data));
      setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen lg:h-screen bg-[#F8F7F2] text-[#333333] font-sans flex flex-col p-4 md:p-6 lg:overflow-hidden">
      <header className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-end border-b border-[#E2E1DB] pb-4 shrink-0 gap-4 lg:gap-0">
        <div>
          <button type="button" onClick={() => setAppMode('DASHBOARD')} className="text-left group outline-none">
            <h1 className="text-3xl font-light tracking-tight text-[#4B7270] group-hover:text-[#3D5D5B] transition-colors">PrintPal <span className="font-bold text-[#333333] group-hover:text-black">3D</span></h1>
            <p className="text-xs uppercase tracking-widest text-[#8A8A8A] mt-1">AI-Assisted 3D Printing Workflow Utility • <span className="font-mono italic">Precision Lab Edition</span></p>
          </button>
        </div>
        
        {appMode === 'PLANNER' && (
          <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-[#8A8A8A] mr-1 hidden lg:inline">Starter Scenarios:</span>
              {STARTERS.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleStartPlannerWithStarter(s.data)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white border border-[#E2E1DB] rounded-full text-[10px] uppercase font-bold hover:bg-[#F8F7F2] text-[#333333] transition-colors focus:outline-none focus:ring-1 focus:ring-[#4B7270] focus:border-[#4B7270]"
                >
                  {s.label}
                </button>
              ))}
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-6 pb-6 lg:pb-0 lg:overflow-hidden">
        
        {appMode === 'DASHBOARD' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:overflow-y-auto">
            {/* Primary Action */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-[#E2E1DB] p-8 flex flex-col items-center justify-center text-center">
                <Box className="w-12 h-12 text-[#4B7270] mb-4" />
                <h2 className="text-xl font-bold uppercase tracking-wider text-[#333333] mb-2">Print Planner</h2>
                <p className="text-sm text-[#8A8A8A] max-w-md mx-auto mb-8">Formalize your approach before warming up the bed. Generate pre-checks, material watch-outs, and documentation gaps.</p>
                <button 
                  type="button"
                  onClick={handleStartPlannerEmpty}
                  className="bg-[#4B7270] hover:bg-[#3D5D5B] text-white px-8 py-3 rounded text-xs font-bold uppercase tracking-widest transition-colors shadow-md"
                >
                  Start New Print Plan
                </button>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                   {STARTERS.map((s, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => handleStartPlannerWithStarter(s.data)}
                      className="text-[10px] px-3 py-1 bg-gray-50 border border-[#E2E1DB] rounded text-[#8A8A8A] hover:bg-gray-100 uppercase tracking-wider font-bold transition-colors"
                    >
                      Use Starter: {s.label}
                    </button>
                   ))}
                </div>
              </div>
              
              <div className="bg-[#FFFCF0] border border-[#F5EAD2] p-4 rounded text-xs leading-relaxed text-[#7D6B45]">
                 <strong className="text-sm uppercase block mb-1">Advisory Reminder</strong>
                 PrintPal 3D is a planning and documentation aid only. Always verify printer settings, material handling, post-processing, ventilation, and safety practices against your printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets.
              </div>
            </div>

            {/* Secondary Modules */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest mb-2 border-b border-[#E2E1DB] pb-2">Active Modules</h3>
              
              <button type="button" onClick={() => setAppMode('MATERIAL_COMPASS')} className="text-left bg-white rounded-lg shadow-sm border border-[#E2E1DB] p-4 hover:border-[#4B7270] transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                  <Compass className="w-5 h-5 text-[#4B7270] opacity-80 group-hover:opacity-100" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">Material Compass</h4>
                </div>
                <p className="text-[10px] text-[#8A8A8A]">Review material context, required source documents, and behavioral considerations.</p>
              </button>

              <button type="button" onClick={() => setAppMode('FAILURE_REVIEW')} className="text-left bg-white rounded-lg shadow-sm border border-[#E2E1DB] p-4 hover:border-[#4B7270] transition-colors group">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-[#4B7270] opacity-80 group-hover:opacity-100" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#333333]">Failure Review</h4>
                </div>
                <p className="text-[10px] text-[#8A8A8A]">Structure a cautious troubleshooting frame for a failed print. (No images supported).</p>
              </button>
              
              <h3 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-widest mt-6 mb-2 border-b border-[#E2E1DB] pb-2">Future Modules</h3>

              <div className="bg-gray-50 rounded-lg border border-[#E2E1DB] border-dashed p-4 opacity-60 pointer-events-none">
                <div className="flex items-center gap-3 mb-1">
                  <Settings className="w-4 h-4 text-[#8A8A8A]" />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Printer Profiles</h4>
                </div>
                <p className="text-[9px] text-[#8A8A8A] italic">Not active in this prototype.</p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-[#E2E1DB] border-dashed p-4 opacity-60 pointer-events-none">
                <div className="flex items-center gap-3 mb-1">
                  <Database className="w-4 h-4 text-[#8A8A8A]" />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Materials Library</h4>
                </div>
                <p className="text-[9px] text-[#8A8A8A] italic">Not active in this prototype.</p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-[#E2E1DB] border-dashed p-4 opacity-60 pointer-events-none">
                <div className="flex items-center gap-3 mb-1">
                  <BookOpen className="w-4 h-4 text-[#8A8A8A]" />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Lab Notebook History</h4>
                </div>
                <p className="text-[9px] text-[#8A8A8A] italic">Not active in this prototype.</p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-[#E2E1DB] border-dashed p-4 opacity-60 pointer-events-none">
                <div className="flex items-center gap-3 mb-1">
                  <Wrench className="w-4 h-4 text-[#8A8A8A]" />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Maintenance Tracker</h4>
                </div>
                <p className="text-[9px] text-[#8A8A8A] italic">Not active in this prototype.</p>
              </div>

              <div className="bg-gray-50 rounded-lg border border-[#E2E1DB] border-dashed p-4 opacity-60 pointer-events-none">
                <div className="flex items-center gap-3 mb-1">
                  <PlayCircle className="w-4 h-4 text-[#8A8A8A]" />
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Failure Pattern Review</h4>
                </div>
                <p className="text-[9px] text-[#8A8A8A] italic">Not active in this prototype.</p>
              </div>
            </div>
          </div>
        )}

        {appMode === 'PLANNER' && (
          <>
            <aside className="w-full lg:w-[360px] bg-white rounded-lg shadow-sm border border-[#E2E1DB] flex flex-col shrink-0 lg:overflow-hidden h-auto lg:h-full">
              <div className="p-4 bg-[#4B7270] text-white text-xs font-bold uppercase tracking-wider shrink-0 flex justify-between items-center">
                <span>Print Configuration</span>
                <button
                  type="button"
                  onClick={() => setAppMode('DASHBOARD')}
                  className="px-2 py-0.5 border border-white/30 rounded text-[9px] uppercase font-bold text-white hover:bg-[#3D5D5B] focus:outline-none focus:ring-1 focus:ring-white transition-colors"
                >
                  Back
                </button>
              </div>
              <div className="flex-1 h-auto lg:overflow-y-auto w-full">
                <PlanningForm initialData={formData} onSubmit={handleSubmit} isLoading={isLoading} />
              </div>
            </aside>

            <section id="result-section" className="w-full lg:flex-1 bg-white rounded-lg shadow-md border border-[#E2E1DB] flex flex-col h-auto lg:h-full lg:overflow-hidden">
              {isLoading ? (
                <div className="flex-1 flex flex-col p-6 max-w-4xl mx-auto w-full h-auto lg:overflow-hidden">
                   <div className="border border-[#E2E1DB] p-4 flex justify-between items-center rounded-t-lg bg-[#F8F7F2]">
                     <div className="h-4 bg-[#E2E1DB] rounded w-1/3"></div>
                   </div>
                   <div className="border-x border-b border-[#E2E1DB] p-6 lg:flex-1 rounded-b-lg space-y-6 lg:overflow-y-auto">
                     <div className="animate-pulse">
                       <div className="h-2 w-24 bg-[#E2E1DB] mb-2 rounded"></div>
                       <div className="h-16 w-full bg-[#E2E1DB] bg-opacity-20 rounded border border-[#E2E1DB]"></div>
                     </div>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
                       <div className="space-y-4">
                         <div className="h-2 w-32 bg-[#E2E1DB] mb-2 rounded"></div>
                         <div className="h-12 w-full bg-[#E2E1DB] bg-opacity-20 rounded"></div>
                         <div className="h-2 w-32 bg-[#E2E1DB] mb-2 rounded"></div>
                         <div className="h-12 w-full bg-[#E2E1DB] bg-opacity-20 rounded"></div>
                       </div>
                       <div className="space-y-4">
                         <div className="h-2 w-32 bg-[#E2E1DB] mb-2 rounded"></div>
                         <div className="space-y-2">
                           <div className="h-4 w-full bg-[#E2E1DB] bg-opacity-20 rounded"></div>
                           <div className="h-4 w-5/6 bg-[#E2E1DB] bg-opacity-20 rounded"></div>
                           <div className="h-4 w-4/6 bg-[#E2E1DB] bg-opacity-20 rounded"></div>
                         </div>
                       </div>
                     </div>
                     <div className="flex items-center justify-center pt-8">
                         <span className="text-[10px] uppercase font-bold text-[#8A8A8A] tracking-widest text-center animate-pulse">Generating structured planning card...</span>
                     </div>
                   </div>
                </div>
              ) : result ? (
                <div className="flex-1 h-auto lg:h-full lg:overflow-hidden">
                  <ResultCard card={result} formData={formData} />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 text-[10px] uppercase text-[#8A8A8A] tracking-widest text-center min-h-[200px]">
                  Adjust the formulation on the left, then generate a planning card.
                </div>
              )}
            </section>
          </>
        )}

        {appMode === 'FAILURE_REVIEW' && (
          <FailureReview onBack={() => setAppMode('DASHBOARD')} />
        )}

        {appMode === 'MATERIAL_COMPASS' && (
          <MaterialCompass onBack={() => setAppMode('DASHBOARD')} />
        )}

      </main>
    </div>
  );
}
