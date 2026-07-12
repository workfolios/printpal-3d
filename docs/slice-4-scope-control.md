# Phase 3D Slice Four Scope Control

## Included

- Saved Attempt planning workflow.
- Structured Project and Attempt context mapping.
- Editable Plan object embedded in Attempt.
- Explicit output-origin labels.
- Common planning API response envelope.
- Prompt, rules, model, warning, and error metadata.
- Labeled deterministic fallback.
- User-authored Plan path.
- Debounced local save and explicit save.
- AI-output schema and safety validation.
- Desktop and mobile workflow regression testing.

## Excluded

- Outcome capture.
- Attempt duplication.
- Deterministic attempt comparison.
- AI comparison interpretation.
- Next-Test Plan generation.
- Export, import, backup, or restore.
- Authentication or cloud synchronization.
- External database or hosted storage.
- Deployment or direct Google AI Studio modification.
- Automated source retrieval or web ingestion.

## High-Risk Change Classification

This slice contains one primary high-risk change category: the AI planning contract and its integration into existing local records. It does not combine that change with a schema-version migration, storage-engine migration, import/restore logic, deployment migration, or major navigation replacement.
