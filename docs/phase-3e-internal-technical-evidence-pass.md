# PrintPal 3D — Phase 3E Internal Technical Evidence Pass

## 1.0 Document Purpose

This record documents the first internal technical evidence pass against the accepted PrintPal 3D V0.4 checkpoint.

The purpose is to identify source-level, validation-level, persistence, AI-governance, safety, and deployment-readiness findings before external scenario evidence is treated as sufficient for a Phase 3E recommendation.

This is a review-only artifact. It does not authorize application-source correction, merge, deployment, hosting, Phase 3F activation, or direct Google AI Studio modification.

## 2.0 Reviewed Baseline

- Repository: `workfolios/printpal-3d`.
- Accepted implementation commit: `48b815360262a2fe346f9668083e2faa557df5c2`.
- Permanent V0.4 checkpoint: `checkpoint/v0.4-slice-9-integrated-ux-regression`.
- Phase 3E review branch: `phase3e/focused-technical-review`.
- Accepted validation run: PrintPal Validation run #122.
- Phase 3E activation validation run: PrintPal Validation run #124.
- Run #124 artifact ID: `8698266791`.
- Run #124 artifact SHA-256: `59dfbf55d2269ab396f9a2f379ec01e814d3bfac9d5f45d964f95d8f24d7d865`.

## 3.0 Review Method

The evidence pass used five methods:

1. Reinspection of the accepted V0.4 governed source snapshot.
2. Reinspection of GitHub Actions validation logs, Playwright retry evidence, and preserved browser traces.
3. Static transaction and relationship analysis across Projects, Attempts, Comparisons, interpretations, Next-Test Plans, export, and restore.
4. Review of AI-route schemas, safety validators, origin labeling, fallback behavior, and model configuration.
5. Comparison of current source behavior against the Phase 3E charter stop conditions and Phase 3C/3D integrity requirements.

No product-source file was modified during this pass.

## 4.0 Validation Evidence

### 4.1 Run #124 Result

PrintPal Validation run #124 completed successfully. TypeScript validation, 92 Vitest tests, frontend and server builds, browser installation, the governed Playwright matrix, source packaging, and evidence preservation all completed.

The Playwright result was **23 passed and 1 flaky**. The WebKit retry involved the decision-support persistence scenario. The first execution expected the user-edited primary variable `Orientation only` after reload, but the persisted field returned the prior rules-based value `Rotate the part orientation`. The retry passed.

### 4.2 Accepted Run #122 Retry Evidence

The accepted run #122 also completed with **23 passed and 1 flaky**. Its WebKit retry occurred in the complete V0.4 backup-and-restoration scenario. After restoration, the expected edited interpretation language was absent and the earlier deterministic fallback interpretation was displayed. The retry passed.

### 4.3 Review Interpretation

A green workflow conclusion does not erase repeatable evidence of a cross-browser save, reactive-rehydration, or export-sequencing race. The two independent WebKit retries affected different user-edited decision-support fields and therefore require material review rather than classification as cosmetic test noise.

## 5.0 Findings Summary

| ID | Severity | Finding | Current Disposition |
|---|---|---|---|
| 3E-001 | P1 | A refreshed deterministic Comparison can retain and reload a stale Next-Test Plan after an Outcome changes. | Confirmed — Correction Required |
| 3E-002 | P2 | Decision-support edits can be lost across reload or backup/restore because local draft state and persistence can race. | Confirmed — Correction Required |
| 3E-003 | P2 | Legacy Reference Tool routes bypass the governed schema, safety-validation, API-envelope, and origin-labeling controls. | Confirmed — Correction Required |
| 3E-004 | P2 | Planned-change token matching can classify undeclared material changes as intentional. | Confirmed — Correction Required |
| 3E-005 | P2 | The hardcoded Gemini model is scheduled for shutdown before a durable deployment horizon. | Confirmed — Correction Required Before Phase 3F |
| 3E-006 | P3 | Import validation rejects self-parenting but does not detect multi-Attempt lineage cycles before write. | Confirmed — Correction Candidate |
| 3E-007 | P3 | The production JavaScript bundle exceeds the current Vite advisory threshold. | Deferred With Rationale |
| 3E-008 | P3 | External Google Fonts create a network and privacy dependency in an otherwise local-first experience. | Deferred With Rationale |
| 3E-009 | P3 | Deployment security and operational hardening remain intentionally incomplete. | Deferred To Phase 3F Gate |

## 6.0 Detailed Findings

### 6.1 3E-001 — Stale Next-Test Plan After Comparison Refresh

**Severity:** P1 — Critical  
**Dimensions:** Deterministic Integrity; Persistence And Recovery; Workflow Utility  
**Workflow Stage:** Outcome edit → Comparison refresh → Decision Support → Export

**Evidence:**

- `src/services/outcomeService.ts` permits a `COMPARED` Attempt to transition back to `OUTCOME_RECORDED` when its Outcome is edited.
- `src/services/comparisonService.ts`, in the stale-existing-comparison path, rebuilds the deterministic Comparison under the same `comparisonId` and updates the two Attempts and Project.
- That transaction does not include the `nextTestPlans` table and does not invalidate, delete, archive, or relink an existing Next-Test Plan.
- `comparedAttempt(...)` preserves existing Attempt properties, including a prior `nextTestPlanId` unless explicitly changed.
- `src/services/decisionSupportService.ts` loads a plan by `comparison.nextTestPlanId` when present, but otherwise falls back to any plan whose `originatingComparisonId` matches the Comparison.

**Failure Mechanism:**

1. A Comparison receives an accepted Next-Test Plan.
2. The user edits one compared Outcome.
3. The existing Comparison becomes stale and is refreshed under the same identifier.
4. The refreshed Comparison no longer carries the prior plan link, but the old plan record remains.
5. Decision Support falls back to the old plan by `originatingComparisonId` and can display it as though it still applies to the changed facts.
6. Export relationship validation may subsequently reject the Project because the plan survives while the refreshed Comparison no longer identifies it as its current plan.

**Product Impact:**

The product can present a stale experimental recommendation after the evidence that produced it has changed. This can misrepresent the decision-memory chain and satisfies the Phase 3E P1 definition for relationship corruption or material misrepresentation.

**Required Correction:**

- Include `nextTestPlans` in the comparison-refresh transaction.
- Invalidate, delete, or explicitly archive plans derived from the stale Comparison.
- Clear obsolete `nextTestPlanId` references from both compared Attempts.
- Do not load a plan solely through `originatingComparisonId` when the Comparison has been refreshed and does not link that plan.
- Add an automated test: accepted plan → edit Outcome → refresh Comparison → stale plan absent → new plan required → export succeeds.

### 6.2 3E-002 — Decision-Support Save And Rehydration Race

**Severity:** P2 — Material  
**Dimensions:** Persistence And Recovery; AI Trust; Workflow Utility  
**Workflow Stage:** Interpretation and Next-Test Plan editing

**Evidence:**

- Run #122 lost edited interpretation language through the backup/restore path on the first WebKit execution.
- Run #124 lost the edited primary variable through reload on the first WebKit execution.
- `src/screens/DecisionSupportScreen.tsx` combines `useLiveQuery`, local draft state, and a `useEffect` keyed to persisted interpretation and plan timestamps.
- The same screen performs asynchronous save operations without a unified dirty-state, pending-write, navigation lock, or export flush control.

**Assessment:**

Reactive database updates can rehydrate local state while user edits or save operations are in flight. The current success-message path does not prove that every visible field was the value committed. Export can also begin before all pending decision-support writes have settled.

**Required Correction:**

- Add explicit dirty, saving, saved, and failed states for interpretation and plan forms.
- Rehydrate local state only on initial record identity change or when the local form is not dirty.
- Persist the current submitted form values rather than relying on potentially stale render state.
- Disable navigation, destructive actions, reload-sensitive actions, and export while a governed save is pending.
- Flush pending writes before backup or Project export.
- Remove retry dependence from persistence assertions and require first-pass WebKit success.

### 6.3 3E-003 — Reference Tools Bypass Governed AI Controls

**Severity:** P2 — Material  
**Dimensions:** Safety And Scope; AI Trust; Source Usefulness  
**Workflow Stage:** Reference Tools — Failure Review and Materials Compass

**Evidence:**

The legacy routes `/api/generate-failure-review` and `/api/generate-material-context`:

- read unvalidated request bodies directly;
- parse model text directly with `JSON.parse`;
- do not pass output through Zod runtime schemas;
- do not apply the planning or decision-support output-safety validators;
- do not return the governed API response envelope;
- do not include `AI_ASSISTED` or `RULES_BASED_FALLBACK` origin metadata;
- return HTTP 200 fallback objects from the catch path.

The corresponding clients only display degraded-service messaging on a failed HTTP response. Because server fallback returns 200, the user cannot distinguish fallback from AI output.

The integrated safety regression matrix exercises modern planning and decision-support safety controls, not these legacy route outputs.

**Required Correction:**

Either:

1. make the non-persistent Reference Tools deterministic-only; or
2. apply request schemas, response schemas, governed envelopes, safety validation, explicit origin labeling, prompt-injection tests, and unsafe-output tests equivalent to the persistent workflow.

### 6.4 3E-004 — Overbroad Planned-Change Classification

**Severity:** P2 — Material  
**Dimensions:** Deterministic Integrity; Technical Credibility  
**Workflow Stage:** Attempt Comparison

**Evidence:**

`isExplainedChange(...)` tokenizes all declared-change text and marks a changed field as explained when any token overlaps the field label, path, or alias set.

Multiple material descriptors contain the generic alias `material`. Therefore the declaration `Change material color` can classify all of these as explained:

- Material Color.
- Material Manufacturer.
- Material Product.

Manufacturer or product changes that were not declared can consequently be removed from the unexplained-change warnings.

**Required Correction:**

- Replace category-token matching with structured declared-change field identifiers where practical.
- At minimum, exclude generic category tokens such as `material` and `printer` from standalone explanation matches.
- Require a specific alias or field-path match.
- Add negative specificity tests for material color versus manufacturer/product and printer technology versus model/configuration.

### 6.5 3E-005 — Gemini 2.5 Flash Shutdown

**Severity:** P2 — Material Deployment Condition  
**Dimensions:** AI Trust; Technical Architecture; Phase 3F Readiness  
**Workflow Stage:** All Gemini-backed routes

**Evidence:**

The source hardcodes `gemini-2.5-flash` in:

- `src/planning/contracts.ts`;
- `src/decisionSupport/contracts.ts`;
- the legacy Failure Review route;
- the legacy Materials Compass route.

Google’s official Gemini deprecations schedule, reviewed July 29, 2026, identifies October 16, 2026 as the earliest shutdown date for `gemini-2.5-flash` and recommends `gemini-3.6-flash` as the replacement.

**Required Correction Before Phase 3F:**

- Centralize model configuration.
- Conduct controlled compatibility validation against the recommended replacement.
- Revalidate structured JSON behavior, latency, safety boundaries, fallback behavior, and output-origin metadata.
- Update model metadata and governed technical documentation.
- Preserve rollback and the AI-optional core workflow.

This finding does not require immediate production migration during evidence gathering, but Phase 3F should not authorize deployment with the current endpoint as an unqualified durable model dependency.

### 6.6 3E-006 — Attempt-Lineage Cycle Validation Gap

**Severity:** P3 — Important  
**Dimensions:** Import Integrity; Persistence And Recovery  
**Workflow Stage:** Full Backup and Project Import

**Evidence:**

The Attempt schema rejects direct self-parenting, and import relationship validation verifies that referenced parent Attempts exist. The reviewed path does not detect a cycle spanning multiple Attempts before data is written.

**Recommended Correction:**

Add directed-cycle validation across `parentAttemptId` relationships before any import transaction begins. Add tests for two-node and longer cycles.

### 6.7 3E-007 — Bundle-Size Advisory

**Severity:** P3 — Important  
**Dimension:** Performance  
**Workflow Stage:** Application load

**Evidence:**

The Vite build reports a 612.20 kB minified main JavaScript chunk, exceeding the default 500 kB advisory threshold.

**Disposition:** Deferred With Rationale.

The current product remains a controlled simulation and passed the governed responsive workflows. Phase 3F should assess route-level lazy loading, dependency splitting, and load performance before public deployment.

### 6.8 3E-008 — External Font Dependency

**Severity:** P3 — Important  
**Dimensions:** Local-First Posture; Privacy; Resilience  
**Workflow Stage:** Application load

**Evidence:**

`src/index.css` imports Inter and JetBrains Mono from `fonts.googleapis.com`.

**Disposition:** Deferred With Rationale.

The application has fallback fonts and core records remain local. Before deployment, decide whether to use system fonts or a compliant self-hosted asset strategy so the local-first experience does not depend on a third-party font request.

### 6.9 3E-009 — Deployment Hardening Not Established

**Severity:** P3 — Important  
**Dimensions:** Security; Operations; Phase 3F Readiness  
**Workflow Stage:** Hosted runtime

**Evidence:**

The current Express server does not establish a deployment-specific security-header, rate-limit, abuse-monitoring, or operational-observability posture. This is consistent with the controlled product-simulation scope, where deployment remained deferred.

**Disposition:** Deferred To Phase 3F Gate.

This is not a Phase 3D acceptance defect. It must become an explicit hosting-architecture and deployment-readiness criterion if Phase 3F is later authorized.

## 7.0 Phase 3E Stop Condition

Phase 3E remains active, but progression to a favorable Phase 3F readiness recommendation is stopped.

The governing stop condition is triggered by:

- one confirmed P1 relationship-integrity finding;
- four confirmed P2 persistence, safety, deterministic-classification, and model-lifecycle findings.

The current internal recommendation is:

**Correct And Re-Review**

This is an interim technical-review position. External technical-co-owner scenarios remain valuable, especially for workflow utility and logging burden, but they must not be used to override unresolved integrity and safety-control defects.

## 8.0 Correction Authorization Boundary

No application-source correction is authorized by this report.

A controlled correction pass requires separate authorization and should:

1. preserve `48b815360262a2fe346f9668083e2faa557df5c2` and the permanent checkpoint unchanged;
2. use a dedicated correction branch;
3. isolate the P1/P2 corrections from P3 deployment optimization;
4. add direct regression tests for every corrected finding;
5. run the complete governed browser, safety, persistence, export, and restore matrix;
6. return to Phase 3E for evidence reconciliation before any Phase 3F decision.

## 9.0 Current Decision

- Phase 3E status: **Active — Stop Condition Applied**.
- Interim recommendation: **Correct And Re-Review**.
- Phase 3F readiness: **Not Ready**.
- Deployment authorization: **None**.
- Product-source correction authorization: **None pending separate user decision**.
