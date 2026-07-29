# PrintPal 3D — Phase 3E Focused Technical Review Charter

## 1.0 Authorization

The user has authorized Phase 3E — Focused Technical Review.

This authorization opens a targeted evaluation of the accepted PrintPal 3D V0.4 checkpoint. It does not authorize deployment, hosting, public release, production certification, authentication, cloud synchronization, an external database, printer control, slicer integration, camera monitoring, image diagnosis, telemetry ingestion, firmware changes, or direct Google AI Studio modification.

## 2.0 Accepted Review Baseline

- Repository: `workfolios/printpal-3d`.
- Canonical implementation branch: `main`.
- Accepted V0.4 merge commit: `48b815360262a2fe346f9668083e2faa557df5c2`.
- Permanent checkpoint: `checkpoint/v0.4-slice-9-integrated-ux-regression`.
- Phase 3E working branch: `phase3e/focused-technical-review`.
- Accepted validation run: PrintPal Validation run #122.
- Accepted validation artifact ID: `8697099503`.
- Accepted artifact SHA-256: `31e7ea5cd2d51e5b3836946bff4105ab28242087061ee0aced80d24d3c2a3c43`.

The Phase 3E review must evaluate this checkpoint without silently substituting a later source state.

## 3.0 Review Objective

Determine whether the accepted V0.4 decision-memory product simulation is technically credible, practically useful, appropriately bounded, and ready to proceed to a separate Phase 3F deployment decision.

Phase 3E is an evidence-gathering and decision phase. It is not a new feature-development phase.

## 4.0 Review Model

The review will remain targeted rather than survey-heavy.

Use:

- The technical co-owner as the primary domain evaluator.
- A small number of technically relevant reviewers only when their expertise adds distinct evidence.
- Scenario-based walkthroughs using realistic print histories and decisions.
- Recorded observations tied to specific screens, fields, outputs, or workflow stages.
- Focused questions about technical credibility, workflow value, burden, safety, and trust.

Do not initiate broad hobbyist recruitment, mass surveys, generalized product polling, or willingness-to-pay research during this phase.

## 5.0 Governing Product Workflow

The reviewed product loop is:

**Project → Attempt → Plan → Outcome → Comparison → Interpretation → Next-Test Plan → Export / Backup / Restore**

The review must test the workflow as one connected decision-memory system rather than as a collection of isolated screens.

## 6.0 Required Review Scenarios

### 6.1 Scenario One — Straightforward Repeatable Print

Use a familiar printer, known material, and low-complexity part.

Evaluate:

- Time and effort required to create the record.
- Whether required fields feel proportionate to value.
- Whether the Plan captures useful context without generic padding.
- Whether the record would help repeat the print later.

### 6.2 Scenario Two — Technically Demanding Or Material-Sensitive Print

Use a print involving meaningful material, geometry, support, environmental, or post-processing considerations.

Evaluate:

- Printer and material-context credibility.
- Source-verification prompts.
- Missing-information and assumption handling.
- Whether AI-assisted content remains bounded and non-authoritative.
- Whether the technical user can correct or override the generated content efficiently.

### 6.3 Scenario Three — Failed, Partial, Or Aborted Print

Use a real or realistic failure with enough context to test Outcome Capture and comparison.

Evaluate:

- Failure-documentation usefulness.
- Whether the application avoids pretending to diagnose causation.
- Whether observed facts remain separate from interpretation.
- Whether the next-test proposal is appropriately narrow and testable.

### 6.4 Scenario Four — Attempt Comparison And Next Test

Create or use two related Attempts with one or more controlled and uncontrolled differences.

Evaluate:

- Deterministic comparison accuracy.
- Planned-change versus unexplained-change distinction.
- Causation boundaries.
- Interpretation credibility and uncertainty disclosure.
- Whether the Next-Test Plan improves the evaluator’s actual next decision.

### 6.5 Scenario Five — Data Portability And Recovery

Export a Project, create a Full Backup, clear local data, restore the backup, and verify relationships.

Evaluate:

- Clarity of local-storage risk disclosures.
- Confidence in export and restore controls.
- Whether the user understands browser-origin dependence.
- Whether the current local-first posture is acceptable for the intended reviewer workflow.

### 6.6 Scenario Six — AI-Degraded Operation

Evaluate the application without a functioning Gemini path.

Evaluate:

- Whether fallback origin is clear.
- Whether core record creation and completion remain usable.
- Whether fallback content is useful without implying AI participation.
- Whether degraded service changes trust or willingness to use the product.

## 7.0 Evaluation Dimensions

Every finding must map to at least one dimension:

| Dimension | Review Question |
|---|---|
| Workflow Utility | Does the product improve a real planning, documentation, comparison, or next-test decision? |
| Logging Burden | Is the record easier and more valuable than the evaluator’s current method? |
| Technical Credibility | Do fields, prompts, comparisons, and interpretations reflect real 3D-printing judgment? |
| Deterministic Integrity | Are recorded facts and differences accurate and reproducible? |
| AI Trust | Are AI, fallback, user-authored, and edited origins clear and appropriately bounded? |
| Safety And Scope | Does the product preserve advisory boundaries and authoritative-source hierarchy? |
| Source Usefulness | Do source references increase trust without excessive clerical work? |
| Persistence And Recovery | Is browser-local storage acceptable, understandable, and recoverable? |
| Accessibility And Responsiveness | Can the evaluator complete the workflow across the governed interaction modes? |
| Product Differentiation | Does PrintPal provide value beyond a generic notebook, spreadsheet, or slicer note field? |

## 8.0 Finding Severity

- **P1 — Critical:** Data loss, relationship corruption, unsafe or materially misleading guidance, secret exposure, core workflow failure, or an error that invalidates the product claim.
- **P2 — Material:** A significant credibility, usability, accessibility, workflow, or trust problem that must be resolved before Phase 3F.
- **P3 — Important:** A non-blocking improvement that should be prioritized or explicitly deferred.
- **P4 — Observation:** Preference, polish, or later-product consideration without current gate impact.

Every finding must include evidence, affected workflow stage, severity, recommendation, and disposition.

## 9.0 Stop Conditions

Stop Phase 3E progression and do not recommend Phase 3F when any of the following occurs:

- A Project, Attempt, Plan, Outcome, Comparison, interpretation, or Next-Test relationship is lost or misrepresented.
- Deterministic comparison reports a materially incorrect change or constant.
- AI or fallback output presents unsupported causation, universal settings, unsafe procedures, or false certification.
- Output origin becomes ambiguous.
- The core workflow requires AI availability.
- Export or restore cannot preserve the accepted relationships.
- Logging burden materially exceeds the value received for the primary evaluator.
- The product does not outperform the evaluator’s current general-purpose documentation method on any meaningful decision.
- A material P1 or P2 finding remains unresolved or lacks an explicit disposition.

## 10.0 Authorized Repository Activity

Phase 3E may add or update review-only assets on `phase3e/focused-technical-review`, including:

- Review charter and evaluator protocol.
- Scenario definitions and test records.
- Findings register.
- Technical-review notes.
- Screenshots or non-sensitive evidence references.
- Recommendation and Phase 3F readiness decision.

Product-source changes are not automatically authorized. A required code correction must be isolated, documented, separately approved, validated, and promoted through a controlled pull request before it can alter the accepted V0.4 checkpoint.

## 11.0 Required Deliverables

Phase 3E must produce:

1. Completed evaluator records for each executed scenario.
2. Consolidated findings register with severity and disposition.
3. Technical credibility assessment.
4. Workflow-utility and logging-burden assessment.
5. Safety, AI-transparency, and source-governance assessment.
6. Persistence and portability assessment.
7. Comparison against the evaluator’s current method.
8. Explicit list of required corrections, recommended improvements, and deferred observations.
9. Phase 3E decision: **Proceed**, **Proceed With Conditions**, **Correct And Re-Review**, **Reframe**, or **Pause**.
10. A separate recommendation on whether Phase 3F may be considered.

## 12.0 Exit Gate

Phase 3E is complete only when:

- The accepted V0.4 checkpoint has been tested through representative scenarios.
- Findings are evidence-linked and severity-classified.
- No unresolved P1 exists.
- Every P2 has been corrected, accepted with an explicit condition, or used to block progression.
- The evaluator’s current workflow has been used as the comparison baseline.
- Product value and logging burden have been assessed together.
- Technical accuracy, deterministic integrity, AI trust, safety, and recovery have been reviewed.
- The final recommendation distinguishes technical-review completion from deployment authorization.

## 13.0 Current Phase Status

**Phase 3E is active.**

The V0.4 checkpoint remains unchanged. Deployment and Phase 3F remain unauthorized pending completion and acceptance of the focused technical review.
