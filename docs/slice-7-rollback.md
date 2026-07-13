# Phase 3D Slice Seven Rollback Record

## Pre-Slice Checkpoint

- Accepted Slice Six commit: `922094d450d28e95b9d97c01fb181b8a0a0fa81d`.
- Permanent Slice Six checkpoint branch: `checkpoint/v0.4-slice-6-deterministic-comparison`.

## Rollback Method

If AI interpretation, fallback disclosure, safety controls, Next-Test persistence, stale-record handling, or responsive workflows fail the exit gate:

1. Do not merge the Slice Seven pull request.
2. Retain `main` at the accepted Slice Six checkpoint.
3. Preserve the Slice Seven branch and validation artifacts for diagnosis.
4. Re-open implementation only after the failed control is isolated.

If a regression is discovered after acceptance, restore from the permanent Slice Six checkpoint branch and verify the Slice Six validation record before resuming work.

## Data Compatibility

Slice Seven uses the existing `comparisons`, `nextTestPlans`, and `attempts` stores under IndexedDB schema version 1. Added Comparison and Next-Test fields are optional or defaulted for earlier records. No destructive migration is introduced. Removing the Slice Seven interface leaves Projects, Attempts, deterministic Comparisons, and Outcomes structurally valid; user-created interpretation and Next-Test records may remain until local data is cleared or restored from a pre-slice backup.
