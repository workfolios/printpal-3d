# Phase 3D Slice Six Rollback Record

## Pre-Slice Checkpoint

- Accepted Slice Five commit: `b23ba006756bdb3339825da7d2c310246e25bf8d`.
- Permanent Slice Five checkpoint branch: `checkpoint/v0.4-slice-5-outcome-attempt-duplication`.

## Rollback Method

If deterministic comparison, transaction integrity, lifecycle transitions, record linking, or responsive workflows fail the exit gate:

1. Do not merge the Slice Six pull request.
2. Retain `main` at the accepted Slice Five checkpoint.
3. Preserve the Slice Six branch and validation artifacts for diagnosis.
4. Re-open implementation only after the failed control is isolated.

If a regression is discovered after acceptance, restore from the permanent Slice Five checkpoint branch and verify the Slice Five validation record before resuming work.

## Data Compatibility

Slice Six uses the existing `comparisons` IndexedDB store, existing optional `Attempt.comparisonIds`, and existing `COMPARED` lifecycle state under schema version 1. It introduces no IndexedDB schema-version change and no destructive migration. Removing the Slice Six interface leaves Projects and Attempts structurally valid; Comparison records and links created during testing may remain until local test data is cleared.
