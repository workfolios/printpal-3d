# PrintPal 3D

**Version:** V0.3.1 Lean Product Simulation Checkpoint

## Product Purpose
PrintPal 3D is a structured 3D print planning utility for hobbyists. It serves as a planning and documentation aid to help you think through a print before starting. It is designed with a calm, professional precision-lab visual direction to reduce cognitive load and prevent failed prints.

## Current Scope
* Dashboard entry screen
* Guided / Technical mode toggle
* Enhanced Print Planner
* Print Planning Card
* Copy Card Text
* Copy Lab Note
* Material Compass preview
* Text-only Failure Review starter
* Future module placeholders
* Server-side Gemini generation
* Client/server fallback behavior
* Hardcoded advisory safety note

## Explicit Non-Scope Items
* **NO** Authentication or User Accounts.
* **NO** Cloud Databases.
* **NO** Hardware control (Printer control, camera access).
* **NO** Slicer Integrations.
* **NO** File Uploads.
* **NO** Universal hard values for printer configuration (speeds, temps, exposure, etc.).
* **NO** Hazardous chemical or firmware advice.

## Safety & Advisory Boundary
PrintPal 3D is a **planning and documentation aid only**. 
Always verify printer settings, material handling, post-processing, ventilation, and safety practices against your printer manual, slicer documentation, manufacturer guidance, Technical Data Sheets, and Safety Data Sheets. The app does NOT claim that any print is load-bearing, food-safe, watertight, chemically resistant, heat-safe, medically safe, electrically safe, or safety-critical.

## Local Configuration & Running
This is a standard React and Express application built with Vite and Tailwind CSS.

### Environment Setup
You MUST configure a Gemini API key for the server-side AI generation to work. The application will function with safety fallbacks even without the key, but it will not utilize generative AI.

1. Ensure you have a `.env` file at the root.
2. Add your Gemini API key:
   `GEMINI_API_KEY="your_api_key_here"`

*(Note: The API key is ONLY accessed server-side resulting in zero client-side exposure).*

### Commands
* `npm install` - Install dependencies
* `npm run dev` - Run the development server
* `npm run build` - Build the application for production
* `npm run start` - Start the production server

## Controlled Prototype Evaluation
This is the V0.3.1 Lean Product Simulation Checkpoint designed for controlled external prototype evaluation by a Primary Beta Evaluator.

**Deployment Note:** Cloud Run, Vercel, or broader public deployment is considered future-state and is not currently supported for production release beyond evaluation.
