# Phase 3D Slice Six Validation Record

## Scope

Deterministic Comparison only. AI interpretation, causal diagnosis, Next-Test Plan generation, export, import, authentication, cloud synchronization, external database, deployment, and AI Studio modification remain deferred.

## Validation Environment

- GitHub Actions Ubuntu 24.04 runner.
- Node.js 22.
- Vitest 3.2.7.
- Playwright Chromium.
- Desktop Chrome device profile.
- Pixel 7 mobile device profile.

## Validation Commands

- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run check`
- `npm run test:e2e`

## Static, Unit, Persistence, And Build Results

- TypeScript validation: passed.
- Domain-schema tests: 15 passed.
- Local-persistence tests: 9 passed.
- Record-workflow tests: 8 passed.
- Planning-service and safety tests: 8 passed.
- Save-coordination tests: 2 passed.
- Outcome and duplication tests: 11 passed.
- Outcome lifecycle and timestamp tests: 4 passed.
- Deterministic-comparison tests: 10 passed.
- Total Vitest tests: 67 passed.
- Vite production frontend build: passed.
- Bundled Express server build: passed.

## Browser Acceptance Results

- Desktop Chromium: passed.
- Pixel 7 mobile Chromium: passed.
- Total Playwright acceptance tests: 2 passed.

The accepted browser scenario verified that a user can:

1. Create a Project and Attempt 1.
2. Generate, edit, and persist a Plan.
3. Record an evaluated Outcome for Attempt 1.
4. Duplicate Attempt 1 into Attempt 2 with a declared planned change.
5. Record a different evaluated Outcome for Attempt 2.
6. Open Deterministic Comparison from Attempt 2.
7. Review the no-causation boundary.
8. Create and persist a Comparison between Attempt 2 and Attempt 1.
9. Review constants, changed fields, Outcome differences, missing information, supported observations, and uncertainties.
10. Confirm both Attempts transition to `COMPARED`.
11. Reload the application and reopen the stored Comparison.
12. Navigate between the Comparison and both Attempts.
13. Continue the existing archive and restore workflow.
14. Complete all screens without horizontal viewport overflow.

## Integrity Controls

- Both Attempts must be different, belong to the selected Project, appear in its Attempt index, and have evaluated Outcomes.
- Comparison generation is deterministic and has no Gemini or other AI dependency.
- Lists and structured values are normalized before equality checks.
- Constants and changed fields remain separate.
- Declared planned changes remain separate from unexplained recorded changes.
- Parent-child and multi-Attempt lineage declarations are aggregated only when the relationship can be established from stored Attempt links.
- Sibling and incomplete-lineage comparisons surface uncertainty rather than treating unrelated declarations as pair-specific evidence.
- Missing information and explicit unknown-information flags are surfaced.
- Source comparison includes category, title, URL, publisher or owner, access date, notes, and authority classification.
- Outcome status, Project success-criterion status, criterion-note, defect, condition, post-processing, and lesson differences are compared directly.
- Criterion-note changes remain explicit even when the criterion status is unchanged.
- `modelInferences` and `alternateExplanations` remain empty.
- Supported observations restate stored values and do not assert causation.
- One unordered Attempt pair resolves to one Comparison identifier.
- If either Attempt changes after comparison, the existing pair record is rebuilt in place rather than returned as stale or duplicated.
- Comparison persistence, bidirectional Attempt links, lifecycle changes, and Project update time occur in one IndexedDB transaction.
- Eligible Attempts transition or return to `COMPARED` through the governed lifecycle without changing original completion timestamps.
- Shared evidence lists apply word-breaking so long unbroken values cannot force horizontal mobile overflow.

## Automated Review Corrections

Automated pull-request review identified five material comparison-integrity and presentation risks. Before acceptance, the implementation was corrected to:

- Rebuild an existing unordered-pair Comparison after either Attempt changes while retaining the Comparison identifier.
- Aggregate planned-change evidence across valid ancestor-descendant and sibling lineages instead of dropping inherited declarations.
- Compare substantive source-reference fields instead of title metadata alone.
- Report success-criterion note changes explicitly when criterion statuses remain the same.
- Permit long evidence strings and URL-like values to wrap in the responsive Comparison view.

Focused tests cover same-pair refresh, lifecycle restoration, lineage aggregation, incomplete-lineage uncertainty, full source-reference comparison, and criterion-note evidence. Desktop and Pixel 7 browser acceptance cover persisted Comparison retrieval and horizontal-overflow prevention.

## Accepted Validation Reference

- Successful pull-request workflow run: `29270281230`.
- Validated branch head: `1e89d45cf62addd9f0ec4b8ddb8ae93b3a27e78a`.
- Validation artifact: `printpal-validation-and-source`.
- Artifact digest: `sha256:d9ae6572865fd230b89bf4b398d9a00dcd1306559976cf6e3438836b09846de9`.

## Final Status

All Slice Six static, unit, persistence, comparison-integrity, transaction, lifecycle, factuality, build, desktop-browser, and mobile-browser gates passed. The implementation is eligible for pull-request acceptance and checkpoint promotion.
