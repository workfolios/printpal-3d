# Phase 3D Slice Six Authorization

## Authorization

The project owner authorized **Phase 3D Slice Six — Deterministic Comparison**.

## Objective

Create a persistent, AI-independent comparison workflow that identifies recorded constants, changes, declared intentional changes, unexplained changes, missing information, and Outcome differences across two evaluated Attempts without asserting causation.

## Authorized Scope

- Select two different evaluated Attempts from the same Project.
- Compare governed printer, material, process, source, and Outcome fields deterministically.
- Separate constants from changes.
- Preserve declared planned changes separately from unexplained recorded changes.
- Identify missing or unknown information.
- Compare Outcome states and Project success-criteria results.
- Generate factual supported observations without causal interpretation.
- Store a validated Comparison record locally.
- Link the Comparison to both Attempts in one transaction.
- Apply governed Attempt lifecycle transitions to `COMPARED`.
- Provide responsive Guided and Technical comparison views.
- Add unit, persistence, transaction, lifecycle, desktop-browser, and mobile-browser validation.

## Excluded Scope

- AI comparison interpretation.
- Causal diagnosis or ranking of likely causes.
- Next-Test Plan generation.
- Automated corrective settings or printer instructions.
- Export, import, backup, or restore.
- Authentication, cloud synchronization, hosted storage, or external database.
- Deployment or direct Google AI Studio modification.

## Rollback Reference

Accepted Slice Five commit: `b23ba006756bdb3339825da7d2c310246e25bf8d`.
Permanent Slice Five checkpoint branch: `checkpoint/v0.4-slice-5-outcome-attempt-duplication`.
