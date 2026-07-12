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
