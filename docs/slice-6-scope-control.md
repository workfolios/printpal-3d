# Phase 3D Slice Six Scope Control

## Included

- Deterministic comparison of two different evaluated Attempts from one Project.
- Governed printer, material, process, source-reference, and Outcome field comparison.
- Normalized constants and changed-field identification.
- Separate declared planned changes and unexplained recorded changes.
- Missing-information and unknown-information identification.
- Outcome-status, success-criterion, defect, condition, post-processing, and lesson differences.
- Factual supported observations with an explicit no-causation boundary.
- Persistent Comparison records in the existing IndexedDB comparison store.
- Transactional links from one Comparison to both Attempts.
- Governed `OUTCOME_RECORDED -> COMPARED` lifecycle transitions.
- Guided and Technical responsive comparison views.
- Unit, persistence, transaction, lifecycle, desktop-browser, and mobile-browser validation.

## Excluded

- AI comparison interpretation.
- Causal diagnosis, likely-cause ranking, or confidence scoring.
- Next-Test Plan generation.
- Automated corrective settings or procedural printer instructions.
- Editing deterministic facts or changing stored source values through the Comparison view.
- Export, import, backup, or restore.
- Authentication, cloud synchronization, hosted storage, or external database.
- Deployment or direct Google AI Studio modification.

## High-Risk Change Classification

This slice introduces one principal high-risk change category: transactionally linking a persistent Comparison record to two existing Attempts while preserving lifecycle integrity. It does not combine that change with a database-version migration, storage-engine migration, AI interpretation contract, import/restore logic, deployment migration, or authentication.
