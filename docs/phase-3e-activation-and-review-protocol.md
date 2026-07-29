# PrintPal 3D — Phase 3E Focused Technical Review Activation And Protocol

## 1.0 Authorization

Phase 3E — Focused Technical Review is authorized.

This phase evaluates the accepted PrintPal 3D V0.4 checkpoint through targeted technical inspection and scenario-based review. It does not authorize deployment, hosting, public release, authentication, cloud synchronization, an external database, direct Google AI Studio modification, printer control, slicer integration, camera monitoring, image diagnosis, firmware modification, or new product-feature development.

## 2.0 Governed Baseline

- Canonical repository: `workfolios/printpal-3d`.
- Accepted `main` commit: `48b815360262a2fe346f9668083e2faa557df5c2`.
- Permanent checkpoint: `checkpoint/v0.4-slice-9-integrated-ux-regression`.
- Phase 3E working branch: `phase3e/focused-technical-review`.
- Accepted validation run: PrintPal Validation run #122.
- Accepted validation artifact: `8697099503`.
- Accepted artifact SHA-256: `31e7ea5cd2d51e5b3836946bff4105ab28242087061ee0aced80d24d3c2a3c43`.

The permanent checkpoint remains immutable. Phase 3E findings, review records, and any later proposed corrections must remain isolated from the checkpoint until separately authorized.

## 3.0 Objective

Determine whether the V0.4 product simulation is technically coherent, understandable, recoverable, safe, and credible enough to support a Phase 3F deployment decision.

The review must distinguish:

- Verified defects.
- Material technical risks.
- Workflow friction.
- Documentation gaps.
- Deployment-readiness questions.
- Optional optimization opportunities.

The review must not convert observations into implementation changes without a separate correction authorization.

## 4.0 Review Participants

The review is targeted rather than survey-heavy.

Required participants:

- Technical co-owner or primary 3D-printing evaluator.
- Product owner / workflow reviewer.

Optional targeted reviewers, limited to a small number:

- Web application engineer familiar with React, Vite, Express, IndexedDB, and browser-resident applications.
- 3D-printing practitioner able to assess terminology, workflow realism, material-context prompts, failure-documentation prompts, and decision-memory usefulness.
- Accessibility or UX reviewer for keyboard, focus, labeling, responsive behavior, and comprehension.

No broad hobbyist recruitment campaign is authorized or required.

## 5.0 Review Tracks

### 5.1 Architecture And Source Integrity

Evaluate:

- Canonical-source clarity and checkpoint immutability.
- React/Vite/Express boundary.
- Server-side Gemini-key handling.
- Typed route-state architecture.
- Zod validation coverage.
- Dependency concentration and coupling.
- Build reproducibility.
- CI workflow reliability and evidence preservation.

### 5.2 Data, Persistence, And Recovery

Evaluate:

- IndexedDB/Dexie data model coherence.
- Project, Attempt, Plan, Outcome, Comparison, interpretation, and Next-Test relationships.
- Transaction and rollback behavior.
- Export-envelope versioning.
- Project import and full-backup restoration.
- Browser-origin dependence and user-facing recovery disclosure.
- Risks associated with hostname, browser, or device transition.

### 5.3 AI, Fallback, Safety, And Source Governance

Evaluate:

- AI-optional completion of the core record loop.
- Origin labeling and fallback transparency.
- Prompt and response validation.
- Safety-output screening.
- Causation boundaries.
- User-entered technical values versus universal recommendations.
- Manufacturer, manual, TDS, SDS, and slicer-documentation hierarchy.
- Failure behavior when the Gemini key is absent, quota is exhausted, the service fails, or malformed output is returned.

### 5.4 Workflow And Domain Accuracy

Evaluate the complete workflow:

**Project → Attempt → Plan → Outcome → Comparison → Interpretation → Next-Test Plan → Export / Backup / Restore**

Reviewers must assess:

- Whether each step reflects a credible 3D-printing decision process.
- Whether required fields are understandable and useful.
- Whether planning assumptions, observed outcomes, changes, and lessons remain distinguishable.
- Whether deterministic comparison precedes interpretation clearly.
- Whether one-primary-variable next-test planning is practical.
- Whether Reference Tools are correctly framed as non-persistent advisory utilities.

### 5.5 UX, Accessibility, And Responsive Behavior

Evaluate:

- Keyboard-only completion of core workflows.
- Skip navigation and route-focus behavior.
- Accessible names, headings, landmarks, and status communication.
- Guided versus Technical mode comprehension.
- Mobile and narrow-width usability.
- Horizontal overflow and long-token handling.
- Destructive-action clarity.
- Automated accessibility evidence versus formal certification boundaries.

### 5.6 Performance, Build, And Operational Diagnostics

Evaluate:

- JavaScript bundle-size advisory and code-splitting opportunities.
- Initial-load and route-transition behavior.
- Dependency loading and unused-module risk.
- CI runtime and browser-matrix duration.
- Expected missing-Gemini-key logging.
- Non-blocking metadata warning observed in CI.
- Error-message usefulness and environment-specific diagnostics.
- Node and GitHub Actions runtime compatibility.

This track is diagnostic. It does not authorize optimization changes.

## 6.0 Scenario-Based Walkthroughs

### 6.1 Scenario One — First Baseline Record

Create a Project and Attempt 1, document intent and success criteria, generate or author a Plan, edit the Plan, save it, reload the application, and retrieve the record.

Questions:

- Is the planning structure technically and practically credible?
- Are assumptions and missing information visible?
- Is AI origin clear?
- Can the workflow continue without AI?

### 6.2 Scenario Two — Outcome And Controlled Change

Record a partial or failed Outcome, use the failure-documentation prompts, duplicate the Attempt, define one controlled change, and save Attempt 2.

Questions:

- Are inherited and changed fields distinguishable?
- Does the workflow discourage uncontrolled multi-variable changes?
- Are failure prompts useful without claiming diagnosis?

### 6.3 Scenario Three — Comparison And Next Test

Record Attempt 2's Outcome, create the deterministic Comparison, review constants and changes, generate or author interpretation, and accept a one-primary-variable Next-Test Plan.

Questions:

- Are recorded facts separated from interpretation?
- Does the product avoid unsupported causal claims?
- Is the proposed next test understandable and technically plausible?

### 6.4 Scenario Four — AI-Degraded Operation

Repeat planning and decision-support steps with the Gemini key absent or the service unavailable.

Questions:

- Can the user complete the workflow?
- Is rules-based fallback labeled clearly?
- Are error messages proportionate and useful?

### 6.5 Scenario Five — Backup, Destruction, And Recovery

Export a Project and Full Backup, delete all local data using the governed confirmation, restore the Full Backup, and verify all relationships.

Questions:

- Are destructive controls deliberate?
- Is recovery understandable?
- Do all linked records survive restoration?
- Are browser-origin and export-file risks disclosed clearly?

### 6.6 Scenario Six — Mobile And Keyboard Review

Complete the primary navigation and one representative record workflow on the governed mobile viewport and with keyboard-only interaction.

Questions:

- Is any control inaccessible or ambiguous?
- Does focus move predictably?
- Is content readable without trapped scrolling or horizontal overflow?

## 7.0 Finding Classification

- **P1 — Critical:** Data loss, broken relationships, unsafe guidance, secret exposure, core workflow failure, invalid restoration, or material scope breach.
- **P2 — Material:** Significant workflow confusion, accessibility blocker, misleading AI/source behavior, reproducible cross-browser defect, or architecture issue likely to affect deployment choice.
- **P3 — Improvement:** Non-blocking performance, maintainability, copy, diagnostic, or usability improvement.
- **Observation:** Context requiring documentation or monitoring but no current correction.

Every finding must include:

- Scenario or source location.
- Reproduction steps.
- Expected behavior.
- Observed behavior.
- Severity.
- Evidence.
- Recommended disposition: correct before Phase 3F, accept as known limitation, defer, or reject.

## 8.0 Stop Conditions

Stop the review and do not recommend Phase 3F when:

- Stored relationships are lost or corrupted.
- Backup restoration is incomplete or non-atomic.
- The core workflow requires AI availability.
- AI origin or fallback labeling becomes ambiguous.
- Safety or source-governance controls fail.
- A client-side secret is exposed.
- Keyboard access is blocked for a core workflow.
- A material cross-browser failure is reproducible.
- Source, checkpoint, documentation, and runtime behavior diverge.

## 9.0 Deliverables

Phase 3E will produce:

1. Technical review evidence register.
2. Scenario walkthrough record.
3. Findings and severity log.
4. Architecture and maintainability assessment.
5. Data-integrity and recovery assessment.
6. AI, safety, and source-governance assessment.
7. UX, accessibility, and responsive assessment.
8. Performance and operational-diagnostics assessment.
9. Phase 3E final technical review report.
10. Phase 3F readiness recommendation: proceed, proceed with conditions, or do not proceed.

## 10.0 Exit Gate

Phase 3E is complete only when:

- Required walkthroughs are completed and recorded.
- All P1 and P2 findings have a disposition.
- The accepted checkpoint remains unchanged.
- Any proposed correction package is separately scoped and authorized.
- Known limitations are reconciled.
- The final report states whether the workflow and data model are proven sufficiently for a deployment decision.
- No deployment action has occurred.

## 11.0 Current Status

**Phase 3E is active.**

The review branch and protocol are established. Technical inspection and targeted scenario evidence collection may proceed. Phase 3F and deployment remain unauthorized.