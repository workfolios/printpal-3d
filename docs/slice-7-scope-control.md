# Phase 3D Slice Seven Scope Control

## Included

- Normalized deterministic Comparison request package.
- `POST /api/interpret-comparison` and `POST /api/generate-next-test`.
- Structured interpretation and Next-Test response envelopes.
- Server and client schema validation.
- Server and client safety-output checks.
- Explicit origin, model, prompt, rules, and generation metadata.
- Rules-based fallback for both routes.
- Editable interpretation summary, conditional inferences, alternate explanations, interpretation uncertainty, and source checks.
- Editable Next-Test question, one primary variable, optional supporting variable, constants, observations, source checks, expected learning, and uncertainty.
- Draft, accepted, and rejected plan statuses.
- One linked Next-Test Plan per Comparison.
- Accepted-plan link to the latest compared Attempt.
- Currentness checks based on the deterministic Comparison and compared Attempt lifecycle.
- Stale interpretation and plan cleanup after deterministic refresh.
- Guided and Technical responsive decision-support views.

## Excluded

- Causal diagnosis or definitive root-cause language.
- Likely-cause ranking or numeric confidence scores.
- Changes to deterministic constants, changes, Outcome differences, or Attempt source facts.
- Automatic application of a Next-Test Plan to printer settings.
- Automatic creation of a new Attempt.
- Image analysis.
- Automated web or source-document retrieval.
- Export, import, backup, or restore.
- Authentication, cloud synchronization, hosted storage, or external database.
- Deployment or direct Google AI Studio modification.

## High-Risk Change Classification

This slice introduces one principal high-risk category: AI-assisted interpretation and planning persistence layered on an existing deterministic Comparison. It does not combine that change with a database-version migration, storage-engine migration, import/restore logic, deployment migration, or authentication.
