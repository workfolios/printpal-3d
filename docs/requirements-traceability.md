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
