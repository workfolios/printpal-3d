# Phase 3D Slice Seven Authorization

## Authorization

The project owner authorized **Phase 3D Slice Seven — AI Interpretation And Next-Test Planning**.

## Objective

Add a bounded, transparent AI layer on top of the accepted deterministic Comparison so the user can review cautious hypotheses, alternate explanations, uncertainty, source checks, and one controlled next-test plan without changing stored Attempt facts or presenting correlation as causation.

## Authorized Scope

- Send only the normalized deterministic Comparison package to the AI routes.
- Add separate comparison-interpretation and next-test API contracts.
- Preserve deterministic facts separately from AI or fallback interpretation.
- Generate conditional interpretations, alternate explanations, uncertainty statements, and source checks.
- Generate one-primary-variable Next-Test Plans with constants, observation requirements, expected learning, and uncertainty.
- Provide explicit AI, rules-based fallback, user-authored, and AI-user-edited origins.
- Permit users to edit, save as draft, accept, or reject generated Next-Test Plans.
- Persist interpretation metadata and one linked Next-Test Plan per Comparison.
- Link an accepted plan to the latest compared Attempt without changing the deterministic Comparison timestamp.
- Block decision-support persistence when the factual Comparison is stale.
- Remove stale interpretation and linked Next-Test records when the deterministic Comparison is refreshed.
- Add static, unit, persistence, safety, desktop-browser, and mobile-browser validation.

## Excluded Scope

- Causal diagnosis, root-cause ranking, or confidence scoring.
- Autonomous changes to Attempt facts.
- Universal printer, material, slicer, exposure, wash, cure, or operating values.
- Automated corrective procedures or printer control.
- Creating a new Attempt automatically from an accepted plan.
- Export, import, backup, or restore.
- Authentication, cloud synchronization, hosted storage, external database, deployment, or direct AI Studio modification.

## Rollback Reference

Accepted Slice Six commit: `922094d450d28e95b9d97c01fb181b8a0a0fa81d`.
Permanent Slice Six checkpoint branch: `checkpoint/v0.4-slice-6-deterministic-comparison`.
