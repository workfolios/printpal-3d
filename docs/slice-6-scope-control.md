# Phase 3D Slice Six Scope Control

## Included

- Deterministic comparison of two different indexed and evaluated Attempts from one Project.
- Governed printer, material, process, substantive source-reference, and Outcome field comparison.
- Normalized constants and changed-field identification.
- Separate declared planned changes and unexplained recorded changes.
- Parent-child, ancestor-descendant, and sibling-lineage planned-change aggregation when supported by stored relationships.
- Missing-information, unknown-information, and incomplete-lineage uncertainty identification.
- Outcome-status, success-criterion status, criterion-note, defect, condition, post-processing, and lesson differences.
- Factual supported observations with an explicit no-causation boundary.
- Persistent Comparison records in the existing IndexedDB comparison store.
- One stable Comparison identifier per unordered Attempt pair.
- Refresh-in-place when a previously compared Attempt changes.
- Transactional links from one Comparison to both Attempts.
- Governed `OUTCOME_RECORDED -> COMPARED` lifecycle transitions and restoration after a refreshed comparison.
- Guided and Technical responsive comparison views with long-token wrapping.
- Unit, persistence, transaction, lifecycle, desktop-browser, and mobile-browser validation.

## Excluded

- AI comparison interpretation.
- Causal diagnosis, likely-cause ranking, or confidence scoring.
- Next-Test Plan generation.
- Automated corrective settings or procedural printer instructions.
- Editing deterministic facts or changing stored source values through the Comparison view.
- Inferring missing lineage or planned intent when stored relationships are incomplete.
- Export, import, backup, or restore.
- Authentication, cloud synchronization, hosted storage, or external database.
- Deployment or direct Google AI Studio modification.

## High-Risk Change Classification

This slice introduces one principal high-risk change category: transactionally creating or refreshing a persistent Comparison record linked to two existing Attempts while preserving unordered-pair identity and lifecycle integrity. It does not combine that change with a database-version migration, storage-engine migration, AI interpretation contract, import/restore logic, deployment migration, or authentication.
