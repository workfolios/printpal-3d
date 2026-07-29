# PrintPal 3D — Phase 3E Evaluator Protocol And Findings Register

## 1.0 Purpose

Use this record to conduct a focused, scenario-based technical review of the accepted PrintPal 3D V0.4 checkpoint.

The review is intended to determine whether the product is useful, credible, safe, appropriately bounded, and ready for a separate Phase 3F deployment decision. It is not a request for broad feature ideation or general product approval.

## 2.0 Review Baseline

- Product: PrintPal 3D V0.4 Decision-Memory Product Simulation.
- Accepted commit: `48b815360262a2fe346f9668083e2faa557df5c2`.
- Checkpoint: `checkpoint/v0.4-slice-9-integrated-ux-regression`.
- Review branch: `phase3e/focused-technical-review`.
- Data posture: local-first, browser-resident, single-user.
- Product posture: advisory only.

## 3.0 Evaluator Context

| Field | Response |
|---|---|
| Evaluator Name |  |
| Review Date |  |
| Review Role / Expertise |  |
| Printer Technologies Used |  |
| Printer Models Used |  |
| Materials / Resins Used |  |
| Typical Print Categories |  |
| Approximate Experience Level |  |
| Current Documentation Method |  |
| Current AI Use In 3D Printing |  |
| Browser / Device Used |  |

## 4.0 Review Instructions

1. Use real prior prints whenever practical.
2. Complete at least three scenarios, including one technically demanding scenario and one failed, partial, or aborted print.
3. Enter only information you would reasonably record during normal use.
4. Note fields you skipped, resented, misunderstood, or found duplicative.
5. Distinguish a product defect from a personal preference.
6. Identify any technically incorrect, overconfident, unsafe, or causally unsupported language precisely.
7. Compare PrintPal against your current documentation method, not against an imagined blank slate.
8. Do not treat PrintPal output as authoritative printer, slicer, material, chemical, or engineering guidance.

## 5.0 Scenario Record

Copy this section for each executed scenario.

### 5.1 Scenario Identification

| Field | Response |
|---|---|
| Scenario Number |  |
| Scenario Type | Straightforward / Technical / Failed-Or-Partial / Comparison / Recovery / AI-Degraded |
| Real Or Simulated |  |
| Project / Part |  |
| Printer |  |
| Material / Resin |  |
| Intended Outcome |  |
| Existing Documentation Available |  |

### 5.2 Workflow Timing And Burden

| Workflow Stage | Approximate Time | Friction | Value Received | Notes |
|---|---:|---|---|---|
| Project And Attempt Creation |  | Low / Medium / High | Low / Medium / High |  |
| Planning Record |  | Low / Medium / High | Low / Medium / High |  |
| Outcome Capture |  | Low / Medium / High | Low / Medium / High |  |
| Attempt Duplication |  | Low / Medium / High | Low / Medium / High |  |
| Comparison |  | Low / Medium / High | Low / Medium / High |  |
| Interpretation |  | Low / Medium / High | Low / Medium / High |  |
| Next-Test Plan |  | Low / Medium / High | Low / Medium / High |  |
| Export / Backup / Restore |  | Low / Medium / High | Low / Medium / High |  |

### 5.3 Technical Credibility

Rate each item from 1 to 5.

| Review Question | Rating | Evidence / Comment |
|---|---:|---|
| The input structure reflects real print-planning context. |  |  |
| Material and printer prompts are technically relevant. |  |  |
| Missing information is disclosed rather than invented. |  |  |
| User-entered technical values remain context rather than universal advice. |  |  |
| The Plan is useful and editable. |  |  |
| Outcome fields capture what actually matters after printing. |  |  |
| Deterministic comparison correctly identifies constants and changes. |  |  |
| Planned and unexplained changes are distinguished accurately. |  |  |
| Interpretation uses appropriately conditional language. |  |  |
| The Next-Test Plan isolates one meaningful primary variable. |  |  |
| Source prompts improve trust without excessive clerical burden. |  |  |
| Safety and advisory boundaries are clear and appropriate. |  |  |

Rating scale:

- 1 — Incorrect, unusable, or unacceptable.
- 2 — Weak and materially problematic.
- 3 — Directionally useful with meaningful limitations.
- 4 — Credible and clearly useful.
- 5 — Strong, technically credible, and worth preserving.

### 5.4 Decision-Memory Value

| Question | Response |
|---|---|
| Did the record preserve information you would otherwise forget or reconstruct? | Yes / No / Mixed |
| Did the comparison reveal a meaningful difference? | Yes / No / Mixed |
| Did the workflow change what you would do next? | Yes / No / Mixed |
| Would the record help you repeat this print in six months? | Yes / No / Mixed |
| Would you reopen this record before another attempt? | Yes / No / Mixed |
| Did the product outperform your current note-taking method? | Yes / No / Mixed |
| What was the single highest-value output? |  |
| What was the single highest-burden input? |  |
| Which field should be removed, combined, clarified, or made optional? |  |
| Which missing field materially reduced usefulness? |  |

### 5.5 AI And Fallback Trust

| Question | Response |
|---|---|
| Was the output origin clear? | Yes / No / Mixed |
| Did AI-assisted language sound more certain than the evidence allowed? | Yes / No / Mixed |
| Did fallback content remain useful? | Yes / No / Mixed |
| Could you complete the workflow without AI? | Yes / No |
| Did editing AI or fallback content feel natural? | Yes / No / Mixed |
| Did any output imply definitive diagnosis or causation? | Yes / No |
| Did any output imply unsafe procedures or universal settings? | Yes / No |
| Exact language requiring review |  |

### 5.6 Persistence, Export, And Recovery

| Question | Response |
|---|---|
| Was browser-local storage understandable? | Yes / No / Mixed |
| Did the local-data disclosure change your behavior? | Yes / No / Mixed |
| Was Full Backup export understandable? | Yes / No / Mixed |
| Was destructive confirmation appropriately deliberate? | Yes / No / Mixed |
| Did restored data preserve the expected relationships? | Yes / No / Not Tested |
| Is local-only storage acceptable for your current use? | Yes / No / Conditional |
| What would make recovery trustworthy enough for regular use? |  |

### 5.7 Scenario Verdict

| Field | Response |
|---|---|
| Scenario Value | Not Useful / Slightly Useful / Directionally Useful / Clearly Useful / Strongly Useful |
| Technical Credibility | Unacceptable / Weak / Mixed / Credible / Strong |
| Logging Burden | Unacceptable / High / Manageable / Low |
| Trust Posture | Unacceptable / Weak / Mixed / Credible / Strong |
| Would Use Again | Yes / No / Conditional |
| Blocking Finding | Yes / No |
| Summary |  |

## 6.0 Current-Method Comparison

| Dimension | Current Method | PrintPal V0.4 | Better Option | Evidence |
|---|---|---|---|---|
| Initial planning |  |  | Current / PrintPal / Mixed |  |
| Technical context retention |  |  | Current / PrintPal / Mixed |  |
| Outcome documentation |  |  | Current / PrintPal / Mixed |  |
| Attempt comparison |  |  | Current / PrintPal / Mixed |  |
| Source references |  |  | Current / PrintPal / Mixed |  |
| Next-test planning |  |  | Current / PrintPal / Mixed |  |
| Search and retrieval |  |  | Current / PrintPal / Mixed |  |
| Backup and recovery |  |  | Current / PrintPal / Mixed |  |
| Total effort |  |  | Current / PrintPal / Mixed |  |

## 7.0 Findings Register

| ID | Severity | Dimension | Workflow Stage | Finding | Evidence | Recommendation | Disposition |
|---|---|---|---|---|---|---|---|
| 3E-001 |  |  |  |  |  |  | Open |

Severity definitions:

- **P1 — Critical:** Data loss, relationship corruption, unsafe or materially misleading guidance, secret exposure, or core workflow invalidation.
- **P2 — Material:** Significant credibility, usability, accessibility, workflow, or trust failure that must be addressed before Phase 3F.
- **P3 — Important:** Non-blocking improvement that should be prioritized or explicitly deferred.
- **P4 — Observation:** Preference, polish, or later-product consideration without current gate impact.

Allowed dispositions:

- Open.
- Confirmed — Correction Required.
- Confirmed — Accepted Condition.
- Deferred With Rationale.
- Not Reproducible.
- Duplicate.
- Resolved And Revalidated.

## 8.0 Consolidated Assessment

### 8.1 Product Utility

- Strongest workflow value:
- Weakest workflow value:
- Evidence that PrintPal improves a real decision:
- Evidence that PrintPal does not improve the current method:
- Likely repeated-use trigger:
- Likely abandonment trigger:

### 8.2 Logging Burden

- Minimum viable record fields:
- Fields that should remain optional:
- Fields that create unacceptable burden:
- Best point in the workflow to request Outcome entry:
- Best point in the workflow to prompt comparison:

### 8.3 Technical Credibility

- Credible technical behaviors:
- Technically weak or generic behaviors:
- Incorrect or unsafe language:
- Causation-boundary assessment:
- Source-hierarchy assessment:

### 8.4 Data And Recovery

- Local-first acceptance:
- Cross-device need:
- Backup frequency likely to be used:
- Recovery trust assessment:
- Required portability change before deployment consideration:

### 8.5 Product Differentiation

- Value beyond slicer notes:
- Value beyond a generic notebook:
- Value beyond a spreadsheet:
- Capabilities that feel duplicative:
- Most defensible current product claim:

## 9.0 Phase 3E Recommendation

Select one:

- **Proceed** — The checkpoint is credible and useful enough for Phase 3F consideration without material conditions.
- **Proceed With Conditions** — Phase 3F may be considered only with explicit constraints or resolved P2 items.
- **Correct And Re-Review** — Targeted corrections are required before deployment options are evaluated.
- **Reframe** — The workflow or product thesis requires material revision.
- **Pause** — Evidence does not justify continued progression.

### 9.1 Recommendation Rationale

- Selected recommendation:
- Supporting evidence:
- Unresolved P1 findings:
- Unresolved P2 findings:
- Required corrections:
- Accepted conditions:
- Deferred P3/P4 observations:
- Phase 3F readiness: Ready / Not Ready / Conditional.

## 10.0 Review Sign-Off

| Role | Name | Decision | Date | Notes |
|---|---|---|---|---|
| Technical Co-Owner |  |  |  |  |
| Additional Technical Reviewer |  |  |  |  |
| Product / Governance Review |  |  |  |  |

Phase 3F deployment evaluation remains separately governed and is not authorized by completion of this record alone.

## 11.0 Internal Technical Evidence Pass — July 29, 2026

### 11.1 Evidence Status

The internal source, validation, and relationship-integrity review is complete for the initial Phase 3E pass.

- Phase 3E activation validation run #124 completed successfully.
- The run contained one WebKit retry involving a user-edited Next-Test Plan field that did not persist on the first execution.
- The accepted run #122 contained one separate WebKit retry involving edited interpretation text that was absent after backup restoration on the first execution.
- Source review identified one P1 and four P2 correction-required findings.
- No product-source correction has been authorized or applied.

### 11.2 Populated Findings Register

| ID | Severity | Dimension | Workflow Stage | Finding | Evidence | Recommendation | Disposition |
|---|---|---|---|---|---|---|---|
| 3E-001 | P1 | Deterministic Integrity / Persistence | Outcome edit → Comparison refresh → Decision Support | A refreshed Comparison can retain and reload a stale Next-Test Plan derived from superseded facts. | Comparison refresh does not transact on or invalidate `nextTestPlans`; Decision Support falls back by `originatingComparisonId`. | Invalidate linked plans and clear Attempt plan references transactionally; add refresh-after-plan regression coverage. | Confirmed — Correction Required |
| 3E-002 | P2 | Persistence And Recovery / AI Trust | Interpretation and Next-Test editing | User edits can be lost across reload or backup/restore because reactive rehydration and asynchronous saves can race. | Independent WebKit retries in runs #122 and #124 lost edited interpretation or primary-variable values on first execution. | Add dirty/pending state, controlled rehydration, current-value submission, write flushing, and first-pass persistence tests. | Confirmed — Correction Required |
| 3E-003 | P2 | Safety And Scope / AI Trust | Reference Tools | Failure Review and Materials Compass bypass governed schemas, safety validators, envelopes, origin labels, and route-level safety tests. | Legacy routes directly parse model JSON and return HTTP 200 fallback objects without origin metadata. | Make deterministic-only or apply full governed request, response, safety, origin, and regression controls. | Confirmed — Correction Required |
| 3E-004 | P2 | Deterministic Integrity | Attempt Comparison | Generic token overlap can misclassify undeclared material changes as planned. | `material` appears as an alias across color, manufacturer, product, batch, age, storage, and condition descriptors. | Use structured field identifiers or specific aliases; exclude generic category-token matches; add negative tests. | Confirmed — Correction Required |
| 3E-005 | P2 | Model/API Stability | Gemini-backed routes | The hardcoded `gemini-2.5-flash` model is scheduled for shutdown October 16, 2026. | Official Google Gemini deprecations schedule recommends `gemini-3.6-flash`. | Centralize model config and complete controlled replacement-model validation before Phase 3F. | Confirmed — Correction Required Before Phase 3F |
| 3E-006 | P3 | Import Integrity | Project and Full Backup import | Multi-Attempt `parentAttemptId` cycles are not detected before write. | Schema rejects self-parenting and import verifies references, but no directed-cycle validation was found. | Add graph-cycle validation and import tests. | Confirmed — Correction Candidate |
| 3E-007 | P3 | Performance | Application load | Main JavaScript chunk is 612.20 kB minified. | Vite advisory threshold is 500 kB. | Evaluate lazy loading and chunking during deployment readiness. | Deferred With Rationale |
| 3E-008 | P3 | Local-First / Privacy | Application load | Google Fonts introduce an external request into the local-first experience. | `src/index.css` imports from `fonts.googleapis.com`. | Decide on system-font or self-hosted posture before deployment. | Deferred With Rationale |
| 3E-009 | P3 | Security / Operations | Hosted runtime | Rate limiting, security headers, abuse controls, and operational observability are not established. | Current Express build reflects a controlled simulation rather than a hardened hosted service. | Make deployment hardening an explicit Phase 3F gate. | Deferred To Phase 3F Gate |

### 11.3 Interim Consolidated Assessment

**Strongest validated product behavior:** The accepted checkpoint provides a coherent local-first record chain and passes the governed functional matrix under normal execution.

**Primary integrity risk:** A Next-Test Plan can outlive and be re-associated with a refreshed Comparison after the underlying Outcome evidence changes.

**Primary trust risk:** Decision-support edits have shown first-execution persistence failures in WebKit across both reload and backup/restore workflows.

**Primary safety-control risk:** Non-persistent Reference Tools do not share the modern persistent workflow’s schema, output-safety, origin, or route-test controls.

**Primary deployment constraint:** The current Gemini endpoint has a published shutdown date and must be migrated and revalidated before Phase 3F can responsibly authorize deployment.

### 11.4 Interim Phase 3E Recommendation

- Selected recommendation: **Correct And Re-Review**.
- Unresolved P1 findings: `3E-001`.
- Unresolved P2 findings: `3E-002`, `3E-003`, `3E-004`, `3E-005`.
- Phase 3F readiness: **Not Ready**.
- External evaluator work: may continue for workflow utility and logging-burden evidence, but cannot clear the technical stop condition.
- Product-source correction: requires separate explicit authorization.
