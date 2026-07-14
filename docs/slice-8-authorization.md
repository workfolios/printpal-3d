# Phase 3D Slice Eight Authorization

## Authorization

The project owner authorized **Phase 3D Slice Eight — Export, Import, And Data Controls** on July 13, 2026.

## Objective

Add user-controlled portability, recovery, import validation, atomic full-backup restoration, and deliberate local-data deletion without adding cloud storage, authentication, deployment, or external database infrastructure.

## Authorized Scope

- Readable Project Markdown export.
- Structured Project JSON export.
- Complete local Full Backup JSON export.
- Schema and relationship validation before any import write.
- Single-Project import as a new Project with regenerated identifiers.
- Relationship rebuilding across Attempts, Comparisons, Next-Test Plans, and Source References.
- Replace-all Full Backup restoration in one IndexedDB transaction.
- Restoration verification and automatic rollback on write failure.
- Explicit destructive-action confirmations.
- Clear-all local-data control.
- Browser-storage, origin, privacy, and backup disclosures.
- Desktop and Pixel 7 browser validation.

## Excluded Scope

- Cloud synchronization or hosted backup.
- User accounts, authentication, or account recovery.
- Merge-based Full Backup restore.
- Cross-device transfer beyond user-controlled files.
- Automated scheduled backup.
- Native file-system integration.
- Deployment or hosting migration.
- External database infrastructure.
- Direct Google AI Studio modification.

## Rollback Reference

Accepted Slice Seven commit: `d47fd2e6ccc17f841e02b89e4f472bd9d1df0408`.
