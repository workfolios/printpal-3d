# PrintPal 3D

**Version:** V0.4 Decision-Memory Product Simulation  
**Package:** `0.3.1-beta.1`

## Product Purpose

PrintPal 3D is a local-first 3D printing decision-memory and lab-record utility for serious hobbyists and prosumer users. It preserves print intent, printer and material context, planning assumptions, outcomes, attempt differences, bounded interpretation, and controlled next-test planning so users do not need to reconstruct the entire decision process from memory.

The governing workflow is:

**Project → Attempt → Plan → Outcome → Comparison → Interpretation → Next-Test Plan → Export / Backup / Restore**

## Current V0.4 Scope

- Browser-resident Project and Attempt records through IndexedDB.
- Guided and Technical presentation modes over one shared record schema.
- AI-assisted, rules-based-fallback, and user-authored planning.
- User-authored Outcome capture and Attempt duplication.
- Deterministic Attempt comparison before any AI interpretation.
- Bounded interpretation and one-primary-variable Next-Test Plans.
- Readable Project Markdown and relationship-complete Project JSON export.
- Five-table Full Backup export, validated import, atomic replace-all restore, and deliberate clear-all control.
- Integrated material-context and failure-documentation prompts inside the persistent record workflow.
- Standalone V0.3.1 reference utilities retained under **Reference Tools** for non-persistent use.
- Responsive and accessibility-focused web behavior across Chromium, Firefox, WebKit, and Pixel 7 Chromium validation targets.

## Product Boundaries

PrintPal 3D is advisory only. It does not provide:

- Authentication, accounts, hosted storage, or cloud synchronization.
- Printer control, camera access, slicer control, firmware modification, or electrical repair guidance.
- File or image upload, visual failure diagnosis, or automated telemetry ingestion.
- Universal temperatures, speeds, exposure times, wash times, cure times, or other authoritative operating values.
- Hazardous solvent, resin-processing, waste-disposal, ventilation-engineering, or fire-suppression procedures.
- Structural, medical, food-contact, watertightness, chemical-resistance, or other safety-critical validation.

## Safety And Source Hierarchy

Manufacturer manuals, slicer documentation, verified profiles, material Technical Data Sheets, Safety Data Sheets, qualified technical validation, and user judgment remain authoritative. PrintPal records user-entered technical values as context but does not convert them into universal recommendations.

## Local Data And Recovery

Records are stored in the current browser and application origin. Clearing site data, changing browsers, changing devices, or moving to a different application address can remove access to local records. Use **Settings And Data** to export a Full Backup before browser, hostname, device, or deployment transitions.

Exports may contain technical project details, source links, and user notes. Store exported files according to the user’s privacy and recovery requirements.

## Local Configuration

The application uses React, Vite, Tailwind CSS, Express, Dexie, Zod, and the Google GenAI SDK.

### Environment Setup

The server-side AI routes use `GEMINI_API_KEY`. The application remains usable through labeled rules-based fallback when the key is absent or the AI service fails.

1. Create a `.env` file at the repository root.
2. Add:

```text
GEMINI_API_KEY="your_api_key_here"
```

The key is accessed server-side only.

### Commands

- `npm install` — install dependencies.
- `npm run dev` — start the development server.
- `npm run lint` — run TypeScript validation.
- `npm run test` — run unit and persistence tests.
- `npm run build` — build the frontend and bundled Express server.
- `npm run test:e2e` — run the governed browser matrix.
- `npm run check` — run TypeScript, unit tests, and production builds.

## Release Posture

V0.4 is a controlled product simulation and technical-review checkpoint. Deployment, authentication, external databases, cloud synchronization, native mobile packaging, and production certification remain deferred to later governance decisions.
