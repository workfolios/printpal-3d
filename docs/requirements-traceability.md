# PrintPal 3D V0.4 Requirements Traceability

## Slice One — Domain Schemas And Validation

| Requirement Area | Slice One Asset | Verification |
|---|---|---|
| Core data objects | `src/domain/schemas/*` | Schema unit tests |
| Runtime validation | Zod schemas and `safeParse` use | Valid and invalid fixture tests |
| Project and attempt relationships | Project, Attempt, Comparison, and Next-Test schemas | UUID, self-reference, and cross-field tests |
| Lifecycle visibility | `src/domain/lifecycle.ts` | Transition tests |
| AI-origin transparency | `src/domain/origins.ts` and API envelope | Origin validation tests |
| Source governance | Source Reference schema | Authority/category constraints |
| Export and import shape | Export envelope schemas | Full-backup envelope test |
| Schema versioning | `CURRENT_RECORD_SCHEMA_VERSION` | Literal-version validation |
| Existing V0.3.1 UI | No imports from the new domain layer | Build and TypeScript regression checks |
| Persistence | Not implemented in Slice One | Explicitly deferred to Slice Two |

## Slice One Exit Gate

- TypeScript validation passes.
- Schema tests pass.
- Production build passes.
- Existing V0.3.1 UI and server behavior remain unchanged.
- No persistence, navigation, or visible feature changes are introduced.

## Slice Two — Local Persistence Foundation

| Requirement Area | Slice Two Asset | Verification |
|---|---|---|
| Browser-resident persistence | `src/data/db.ts` | Close-and-reopen persistence test |
| IndexedDB abstraction | Dexie database and typed tables | Database initialization and table tests |
| Project CRUD | `ProjectRepository` | Create, retrieve, update, status-transition tests |
| Attempt CRUD | `AttemptRepository` | Create, retrieve, list, update, status-transition tests |
| Related record stores | Comparison and Next-Test repositories | Repository round-trip tests |
| Application settings | `SettingsRepository` | JSON-safe setting round-trip test |
| Atomic project creation | `createProjectWithFirstAttempt` | Commit and rollback tests |
| Cascade deletion | `deleteProjectCascade` | Related-record deletion test |
| Clear local data | `clearAllLocalData` | Five-table clear test |
| Runtime validation before writes | Repository Zod parsing | Invalid-record rejection test |
| Storage disclosure | `src/data/storageMetadata.ts` | Static governance review |
| Existing V0.3.1 UI | No imports from `src/data` | Build and TypeScript regression checks |

## Slice Two Exit Gate

- IndexedDB tables initialize through Dexie.
- Records survive database close and reopen.
- Multi-record writes roll back when a related write fails.
- Project deletion removes related attempts, comparisons, and next-test plans.
- Local data can be cleared without changing the database definition.
- Invalid records are rejected before persistence.
- Existing visible application and Gemini routes remain unchanged.
- Record Library and other V0.4 UI changes remain deferred to Slice Three.

## Slice Three — Record Library And Project Creation

| Requirement Area | Slice Three Asset | Verification |
|---|---|---|
| Record-centered shell | `src/app/AppShell.tsx` and typed route state | Navigation and build review |
| Record Library default | `RecordLibraryScreen` | Default-route and empty-state review |
| Responsive project cards | `ProjectRecordCard` | Mobile, tablet, and desktop class matrix |
| Search and filters | `recordLibraryService.ts` | Search, status, technology, material, and sorting tests |
| Project creation | `NewProjectScreen` | Two-stage required-field flow |
| Project plus Attempt 1 | `projectCreationService.ts` | Schema and IndexedDB integration tests |
| Archive and restore | `ProjectRepository.transitionStatus` | Reactive UI action and repository tests |
| Record retrieval | `AttemptDetailScreen` and `useProjectRecord` | Reactive record read path |
| Guided and Technical modes | Shared schema plus presentation setting | Mode-persistence and shared-field review |
| Existing planner access | `LegacyPlannerScreen` | Existing API and fallback path preserved |
| Existing supporting modules | Material Compass and Failure Review routes | Source modules preserved and accessible |
| Deferred planning integration | Slice Four boundary notice | No Plan object write in Slice Three |

## Slice Three Exit Gate

- Record Library is the default application screen.
- A user can create a Project and Attempt 1 in one transaction.
- Saved records appear reactively without application refresh.
- Search, status, printer-technology, and material-class filters work.
- A user can open, archive, and restore a project.
- Guided and Technical modes use the same stored record schema.
- Responsive layouts use stacked mobile cards and multi-column desktop grids.
- The existing planner, Material Compass, and Failure Review remain accessible.
- Planning-card persistence, outcomes, duplication, comparison, AI interpretation, export, and import remain deferred.

## Slice Four — Planning Record Integration

| Requirement Area | Slice Four Asset | Verification |
|---|---|---|
| Structured planning input | `buildPlanningRequestFromRecord` and `PlanningRecordScreen` | Project, Attempt, success-criteria, concern, source, and freeform mapping tests |
| Persistent Plan object | Embedded `Attempt.plan` through `AttemptRepository.update` | IndexedDB save-and-retrieve test |
| Missing information and assumptions | Plan content schema and generation contracts | Schema and fallback-content tests |
| Source-verification prompts | Saved source summaries plus source-check fields | Request mapping and source-governance review |
| Editable planning content | `PlanningRecordScreen` editable fields and debounced local save | Desktop and mobile browser acceptance |
| AI-origin transparency | Common API envelope and visible origin labels | Envelope, origin-transition, and browser tests |
| Silent fallback correction | Server and client rules-based envelope | Network, invalid-response, and no-key browser scenarios |
| Prompt and rules governance | `PLANNING_PROMPT_VERSION` and `PLANNING_RULES_VERSION` | Stored Plan metadata assertions |
| User-authored continuity | `createUserAuthoredPlan` | AI-unavailable unit and browser workflow |
| Universal-setting boundary | Planning prompt, deterministic fallback, and output safety checks | Safety-instruction and unsafe-output tests |
| Exact user-entered values | Stored only as user context | Request-mapping and language review |
| Existing module continuity | Standalone Quick Planner, Material Compass, and Failure Review | Navigation and regression checks |

## Slice Four Exit Gate

- A Plan can be generated or authored from a selected saved Attempt.
- The Plan is stored locally inside the Attempt record and survives reload.
- AI-assisted, rules-based-fallback, user-authored, and AI-user-edited origins remain explicit.
- Every Plan field remains editable before and after saving.
- Invalid or unavailable AI output cannot prevent user-authored or rules-based Plan saving.
- Prompt and rules versions remain attached to generated Plans.
- AI output is validated for schema and prohibited safety patterns before it is accepted.
- Outcome capture, duplication, comparison, next-test planning, export, and import remain deferred.

## Slice Five — Outcome And Attempt Duplication

| Requirement Area | Slice Five Asset | Verification |
|---|---|---|
| Outcome recording | `OutcomeCaptureScreen` and `outcomeService.ts` | Unit, persistence, desktop, and mobile workflow tests |
| Outcome status coverage | Existing Outcome schema plus governed status options | Five-state outcome tests |
| Success-criteria results | Project-bound criterion validation | Exact criterion-set and browser-entry tests |
| Observations and learning | Outcome observations, defects, unexpected conditions, post-processing, lessons, and notes | Schema, service, and browser retrieval tests |
| AI-independent outcome entry | User-authored Outcome service | No Gemini route or AI dependency |
| Attempt lifecycle completion | Outcome save maps evaluated results to `OUTCOME_RECORDED` and pending evaluation to `PRINTED` | Lifecycle persistence assertions |
| Attempt duplication | `attemptDuplicationService.ts` and `DuplicateAttemptScreen` | Build, transaction, and browser tests |
| Parent relationship | `parentAttemptId` plus Attempt History | Relationship and navigation assertions |
| Inherited context | Printer, material, process, and source-reference cloning | Repository equality tests and UI badges |
| Changed-field visibility | Inherited and Changed field badges | Desktop and mobile acceptance |
| Planned-change capture | `changesFromParentAttempt` requirement | Empty-change rejection and browser workflow |
| Clean child Attempt | New ID, timestamps, attempt number, Draft lifecycle, no Plan, no Outcome | Duplication integrity tests |
| Failure Review integration | Documentation prompts inside Outcome Capture | Failed and partial-outcome browser scenario |
| Existing planning continuity | Saved Plan and standalone planner remain intact | Full regression check |

## Slice Five Exit Gate

- Attempt 1 can receive a complete user-authored Outcome without AI.
- All five required Outcome states are supported.
- Success-criteria results remain tied to the current Project criteria.
- Evaluated Outcomes advance the Attempt to `OUTCOME_RECORDED`; pending evaluation remains `PRINTED`.
- Attempt 2 receives a new identifier, number, timestamps, and parent relationship.
- Applicable printer, material, process, and source context is inherited and editable.
- Inherited and changed fields are visible before the child Attempt is created.
- Planned changes are explicitly recorded.
- The prior Plan, Outcome, comparison links, and completion date are not copied.
- Relationship integrity and transaction rollback tests pass.
- Deterministic comparison, AI interpretation, next-test planning, export, and import remain deferred.

## Slice Six — Deterministic Comparison

| Requirement Area | Slice Six Asset | Verification |
|---|---|---|
| Comparison selection | `ComparisonSetupScreen` | Same-Project, Project-index, different-Attempt, and evaluated-Outcome tests |
| Deterministic field engine | `comparisonService.ts` governed field descriptors | Constants, changes, normalization, and no-AI tests |
| Planned-change lineage | Parent links and `changesFromParentAttempt` aggregation | Direct, ancestor-descendant, sibling, and incomplete-lineage tests |
| Unexplained changes | Pair-specific deterministic evidence classification | Changed-field and uncertainty tests |
| Missing information | Important-field and unknown-information checks | Unit and browser review |
| Source comparison | Full substantive Source Reference projection | URL, publisher, access-date, notes, and authority tests |
| Outcome comparison | Outcome status, success criteria, criterion notes, defects, conditions, post-processing, and lessons | Unit and browser assertions |
| Causation boundary | Empty inference arrays plus fixed uncertainty statements | Content assertions and browser acceptance |
| Persistent Comparison | Existing `comparisons` IndexedDB store | Repository retrieval, reload, and stale-refresh tests |
| Unordered-pair identity | One stable Comparison ID per Attempt pair | Idempotency and refresh-in-place tests |
| Transactional Attempt links | Comparison plus two `comparisonIds` updates | IndexedDB transaction test |
| Governed lifecycle | `OUTCOME_RECORDED -> COMPARED` validation and restoration | Lifecycle and persistence assertions |
| Existing workflow continuity | Plan, Outcome, duplication, archive, and restore regression | Full desktop and mobile scenario |
| Responsive comparison view | `ComparisonRecordScreen` stacked and two-column layouts with long-token wrapping | Desktop and Pixel 7 overflow checks |

## Slice Six Exit Gate

- Two different indexed and evaluated Attempts from one Project can be selected.
- The deterministic engine separates recorded constants from changes.
- Planned-change declarations remain distinguishable from unexplained recorded changes across valid Attempt lineages.
- Incomplete or unrelated lineage evidence is surfaced as uncertainty rather than inferred as pair-specific intent.
- Missing and unknown information are surfaced.
- Full substantive Source Reference values are compared.
- Outcome states, Project success-criteria results, and criterion-note changes are compared directly.
- Supported observations remain factual and do not establish causation.
- AI inference and Next-Test recommendation fields remain empty.
- A validated Comparison record persists locally and survives reload.
- Re-comparing a changed unordered pair refreshes the existing Comparison instead of creating a duplicate or returning stale facts.
- Both Attempts receive the Comparison link transactionally.
- Eligible Attempts transition or return to `COMPARED` without losing completion timestamps.
- Desktop and mobile Chromium workflows pass without horizontal overflow, including long unbroken evidence values.
- AI interpretation, causal diagnosis, Next-Test planning, export, and import remain deferred.
