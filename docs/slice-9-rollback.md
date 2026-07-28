# Phase 3D Slice Nine Rollback Record

## Pre-Slice Checkpoint

- Accepted Slice Eight commit: `ab9b04a545a56df811198462e9fab4d56dde6101`.
- Permanent rollback branch: `checkpoint/v0.4-slice-8-export-import-data-controls`.

## Rollback Method

If the integrated record loop, accessibility controls, responsive layouts, safety matrix, browser matrix, source reconciliation, or V0.3.1 reference utilities regress:

1. Do not promote or merge the Slice Nine pull request.
2. Retain `main` at the accepted Slice Eight checkpoint.
3. Preserve validation logs, browser traces, screenshots, and the governed source snapshot.
4. Isolate the regression inside the Slice Nine branch before repeating validation.

## Data Compatibility

Slice Nine does not change the IndexedDB database version, table structure, domain schema version, export-envelope schema version, or accepted import and restore contracts. Rolling back the Slice Nine interface leaves existing Projects, Attempts, Comparisons, Next-Test Plans, and settings structurally valid.
