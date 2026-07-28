# Phase 3D Slice Nine Scope Control

## Included

- Record-centered navigation refinement.
- Reference Tools consolidation without deleting the original advisory utilities.
- Material Compass content integration into the saved Planning Record.
- Failure Review documentation continuity inside Outcome Capture.
- Visible placeholder, slice-label, and temporary-source cleanup.
- Accessibility semantics, keyboard behavior, focus handling, and reduced-motion support.
- Responsive overflow and content-trap review.
- Chromium, Firefox, WebKit, and Pixel 7 Chromium regression coverage.
- Full-loop backup and restoration acceptance.
- Safety-matrix regression.
- README, version, metadata, requirements-traceability, and source-summary reconciliation.
- Screenshot and source artifact preservation.

## Excluded

- Domain-schema changes.
- Database-version changes.
- New persistence tables.
- AI request or response contract changes.
- Deterministic comparison logic changes.
- Import or restore architecture changes.
- External source retrieval.
- Deployment, authentication, cloud storage, or account recovery.
- Direct changes to Google AI Studio.

## High-Risk Change Classification

Slice Nine is an integration and regression slice. It does not introduce a new high-risk architecture category. Navigation is refined without changing the typed in-memory route-state model, and the original V0.3.1 utilities remain accessible through a consolidated Reference Tools surface.

## Stop Conditions

Stop promotion when any of the following occurs:

- A stored Project, Attempt, Comparison, interpretation, or Next-Test relationship is lost.
- AI origin labeling becomes ambiguous.
- The application requires AI availability to complete the core record loop.
- Import or restore behavior changes outside the accepted Slice Eight contract.
- Safety controls fail any governed scenario.
- Core content becomes inaccessible by keyboard or trapped at a responsive breakpoint.
- GitHub source, README, package metadata, or validation summary diverges.
