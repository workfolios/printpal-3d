# Phase 3D Slice Eight Scope Control

## Included

- Project Markdown and JSON generation.
- Full Backup JSON generation across all five local tables.
- Versioned PrintPal export envelopes.
- Structural and cross-record relationship validation.
- Import metadata preview before any write.
- New-ID Project import with rebuilt relationships.
- Atomic replace-all restore with count verification.
- Local-data deletion confirmation.
- Settings And Data user interface.
- Storage-origin and backup guidance.
- Unit, transaction, rollback, desktop-browser, and mobile-browser validation.

## Excluded

- Full-backup merge or conflict resolution.
- Partial table restore.
- Cloud backup or synchronization.
- User identity or shared workspaces.
- Password-protected export files.
- Automated external-source ingestion.
- Deployment or hostname migration.
- Database-engine migration.

## High-Risk Change Classification

This slice introduces one principal high-risk category: replacing all browser-resident records from a user-selected backup. The control is isolated through full pre-write validation, explicit confirmation, one IndexedDB transaction, post-write count verification, and automatic rollback when a write or verification step fails.
