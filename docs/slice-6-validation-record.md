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

## Local Static, Unit, Persistence, And Build Results

- TypeScript validation: passed.
- Existing domain-schema tests: 15 passed.
- Existing local-persistence tests: 9 passed.
- Existing record-workflow tests: 8 passed.
- Existing planning-service and safety tests: 8 passed.
- Existing save-coordination tests: 2 passed.
- Existing Outcome and duplication tests: 11 passed.
- Existing Outcome lifecycle and timestamp tests: 4 passed.
- New deterministic-comparison tests: 4 passed.
- Total Vitest tests: 61 passed.
- Vite production frontend build: passed.
- Bundled Express server build: passed.

## Required Pull-Request Browser Acceptance

The final GitHub Actions run must verify at desktop and Pixel 7 mobile Chromium viewports that a user can:

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

- Both Attempts must be different, belong to the same Project, and have evaluated Outcomes.
- Comparison generation is deterministic and has no Gemini or other AI dependency.
- Lists are normalized before equality checks.
- Constants and changed fields remain separate.
- Declared planned changes remain separate from unexplained recorded changes.
- Missing information and explicit unknown-information flags are surfaced.
- Outcome and Project success-criterion differences are compared directly.
- `modelInferences` and `alternateExplanations` remain empty.
- Supported observations restate stored values and do not assert causation.
- One unordered Attempt pair resolves to one Comparison record.
- Comparison creation, Attempt links, Attempt lifecycle changes, and Project update time occur in one IndexedDB transaction.
- Existing completion timestamps remain unchanged when Attempts transition to `COMPARED`.

## Final Status

Pending pull-request CI, desktop-browser, mobile-browser, and automated-review acceptance before checkpoint promotion.
