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
