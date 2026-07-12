# Phase 3D Slice Five Validation Record

## Scope

Outcome Capture and Attempt Duplication only. Comparison, AI interpretation, next-test planning, export, import, authentication, cloud synchronization, external database, deployment, and AI Studio modification remain deferred.

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
- Total Vitest tests: 53 passed.
- Vite production frontend build: passed.
- Bundled Express server build: passed.

## Browser Acceptance Results

- Desktop Chromium: passed.
- Pixel 7 mobile Chromium: passed.
- Total Playwright acceptance tests: 2 passed.

The accepted browser scenario verified that a user can:

1. Create a Project and Attempt 1.
2. Generate, edit, and persist the Plan.
3. Record a partially successful Outcome without AI.
4. Record success-criteria results, defects, and lessons.
5. Review the saved Outcome after persistence.
6. Duplicate Attempt 1.
7. See inherited fields and change at least one planned variable.
8. Explicitly record the planned change.
9. Create Attempt 2 with a parent relationship.
10. Confirm Attempt 2 has no copied Plan or Outcome.
11. Navigate between Attempt 1 and Attempt 2.
12. Reload and retrieve the related Attempts.
13. Continue the existing archive and restore workflow.
14. Complete all screens without horizontal viewport overflow.

## Integrity Controls

- Outcome Capture remains fully usable without Gemini or another AI service.
- Outcome criterion results must match the current Project success criteria exactly.
- Evaluated Outcomes transition the Attempt to `OUTCOME_RECORDED`.
- A not-yet-evaluated Outcome transitions the Attempt to `PRINTED`.
- Attempt duplication creates a new identifier, attempt number, and timestamps.
- The child Attempt preserves `parentAttemptId` and the Project attempt index.
- Applicable printer, material, process, and source context is inherited and editable.
- Planned changes are required and stored in `changesFromParentAttempt`.
- The child Attempt does not copy the source Plan, Outcome, completed date, comparison IDs, or next-test reference.
- Duplication and Project-index updates occur in one IndexedDB transaction.

## Accepted Validation Reference

- Successful pull-request workflow run: `29198230980`.
- Validated branch head: `56a96b5775780bcfe1e8ddbfe7c8b25226981378`.
- Validation artifact: `printpal-validation-and-source`.
- Artifact digest: `sha256:31bc29158d52fba4857a51056a85cfef285c2604e1ff65c831d06fa6fe6bdeeb`.

## Final Status

All Slice Five static, unit, persistence, relationship-integrity, build, desktop-browser, and mobile-browser gates passed. The implementation is eligible for pull-request acceptance and checkpoint promotion.
