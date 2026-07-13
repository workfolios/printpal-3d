# Phase 3D Slice Eight Rollback Record

## Pre-Slice Checkpoint

- Accepted Slice Seven commit: `d47fd2e6ccc17f841e02b89e4f472bd9d1df0408`.
- Slice Seven is the controlling rollback state until Slice Eight passes all gates.

## Rollback Method

If export fidelity, import validation, identifier regeneration, relationship rebuilding, restore atomicity, deletion controls, or responsive workflows fail:

1. Do not merge the Slice Eight pull request.
2. Retain `main` at the accepted Slice Seven checkpoint.
3. Preserve failed test fixtures and validation artifacts for diagnosis.
4. Re-open implementation only after the failing portability or recovery control is isolated.

If a regression is discovered after acceptance, restore the Slice Seven checkpoint and verify that no browser data was transformed by a partially completed restore. Full Backup restoration uses one transaction, so a failed restore must retain the prior local dataset.

## Data Compatibility

Slice Eight does not change the IndexedDB table layout or database version. It expands the export-envelope contract while retaining compatibility with the prior object-style application-settings payload. Removing the Slice Eight interface leaves existing Projects, Attempts, Comparisons, Next-Test Plans, and settings structurally valid.
