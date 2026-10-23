# PrintPal 3D — Phase 3E Codespaces Full-Runtime Demo Harness

**Status:** Authorized Phase 3E runtime-enablement infrastructure  
**Purpose:** Restore the accepted V0.4 full-stack React/Express runtime for focused technical-owner demonstration without treating Codespaces as production hosting.  
**Accepted V0.4 product checkpoint:** `48b815360262a2fe346f9668083e2faa557df5c2`  
**Runtime-enablement branch:** `phase3e/codespaces-full-runtime-demo`

## 1. Scope

This harness adds a GitHub Codespaces operating surface for the existing PrintPal application.

It does not:
- resolve or waive existing Phase 3E P1/P2 findings;
- authorize Phase 3F;
- replace the permanent V0.4 checkpoint;
- add authentication, cloud synchronization, an external database, printer control, slicer integration, camera diagnosis, firmware control, or telemetry;
- make GitHub Codespaces the production hosting decision.

The public GitHub Pages deployment remains the lightweight static demo.

## 2. Runtime Model

The Codespace runs:
- Node.js 22;
- the existing React/Vite frontend;
- the existing Express server;
- Dexie/IndexedDB in the user's browser;
- server-side Gemini routes when `GEMINI_API_KEY` is configured;
- labeled Standard Guidance fallback when Gemini is unavailable.

Application data remains browser-local. The Codespace does not become PrintPal's system of record.

## 3. One-Time Human Setup Gate

Create a GitHub Codespaces repository secret named:

`GEMINI_API_KEY`

Use the repository's **Settings → Secrets and variables → Codespaces** controls.

Do not place the key in source, `.env.example`, workflow logs, screenshots, or the browser.

If the secret is absent, the core workflow remains usable and the runtime-status UI reports Standard Guidance.

## 4. Create The Codespace

1. Open `workfolios/printpal-3d`.
2. Select **Code → Codespaces**.
3. Create a Codespace from the runtime-enablement branch while it is under review; after a separately authorized promotion, create it from the promoted branch.
4. The dev-container runs `npm ci`, the governed type/unit/build checks, and builds the production server.
5. Port `3000` is forwarded and labeled **PrintPal 3D Full Runtime**.
6. Keep port `3000` **Private** during Phase 3E.
7. Open the forwarded application URL.

## 5. Runtime Status

`GET /api/runtime-status` returns non-secret runtime provenance:
- runtime class (Codespaces or server);
- whether Gemini is configured;
- AI mode;
- V0.4 source-checkpoint label;
- model identifiers;
- prompt/rules versions;
- timestamp.

The response never returns the Gemini API key.

The frontend reports:
- **Full Runtime / AI Assisted** when the server and Gemini configuration are available;
- **Full Runtime / Standard Guidance** when the server is available without Gemini;
- **Static Demo / Standard Guidance** when no PrintPal server endpoint is reachable, such as GitHub Pages.

## 6. Persistence Boundary

IndexedDB remains tied to the browser origin.

Stopping and resuming the same Codespace is expected to preserve the forwarded origin and ordinary browser records. A newly created Codespace may use a different origin. Before deleting or replacing a Codespace, export a Full Backup. Restore that backup if the runtime origin changes.

## 7. Phase 3E Runtime Acceptance Matrix

Validate:
1. cold Codespace creation;
2. stop/resume;
3. private forwarded-port access;
4. runtime badge;
5. Project and Attempt creation;
6. planning with Gemini configured;
7. planning without Gemini / fallback;
8. Outcome capture;
9. Attempt duplication;
10. deterministic Comparison;
11. Interpretation and Next-Test generation;
12. Project export;
13. Full Backup;
14. clear local data;
15. restore and relationship verification;
16. desktop and mobile browser use.

Existing Phase 3E stop conditions remain in force.

## 8. Governance

Codespaces is an evaluation/runtime harness, not an acceptance signal. A successful Codespaces session establishes only that the application can run in the remote full-stack environment. Product correctness, technical credibility, data integrity, safety, and deployment readiness remain governed by Phase 3E findings and the later Phase 3F decision.
