

## Slice Seven — AI Interpretation And Next-Test Planning

| Requirement Area | Slice Seven Asset | Verification |
|---|---|---|
| Deterministic-only AI input | `buildDeterministicComparisonPackage` | Payload exclusion and service tests |
| Comparison interpretation | `DecisionSupportScreen` and `/api/interpret-comparison` | Structured-envelope, fallback, and browser tests |
| Alternate explanations | Interpretation content contract | Schema and editable-content tests |
| Uncertainty disclosure | Deterministic and interpretation uncertainty sections | Unit and browser assertions |
| Source checks | Interpretation and Next-Test source-check fields | Contract and UI review |
| One-primary-variable planning | `/api/generate-next-test` and governed fallback | Content-schema and fallback tests |
| Constants and observation plan | `NextTestPlanContent` | Unit and browser assertions |
| User control | Edit, draft, accept, and reject actions | Persistence and browser tests |
| Origin transparency | AI, fallback, user-authored, and AI-user-edited origins | Envelope, edit-transition, and UI tests |
| Version governance | Model, prompt, rules, and generated timestamps | Stored-record assertions |
| Comparison currentness | `isComparisonCurrent` | Stale-record tests and UI boundary |
| One linked plan | Comparison and latest-Attempt transaction | Persistence and relationship tests |
| Refresh invalidation | Deterministic Comparison refresh cleanup | Transaction and regression tests |
| Safety controls | Server/client output validation and bounded prompts | Safety-pattern and fallback tests |
| Responsive workflow | Decision Support screen | Desktop and Pixel 7 acceptance |

## Slice Seven Exit Gate

- AI receives only normalized deterministic Comparison facts.
- Deterministic facts remain structurally separate from interpretation.
- Conditional hypotheses, alternate explanations, uncertainty, and source checks remain editable and labeled.
- AI failure produces an explicitly labeled rules-based fallback.
- Next-Test Plans default to one primary variable and state constants and observation requirements.
- Users can save a draft, accept, reject, or author a plan manually.
- AI-authored content becomes `AI_ASSISTED_USER_EDITED` after user modification.
- One Next-Test Plan remains linked to one Comparison; an accepted plan links the latest compared Attempt.
- Stale Comparisons block interpretation and plan persistence until deterministic facts are refreshed.
- Refreshing deterministic facts removes stale interpretation and linked planning records.
- Safety and causal-overreach controls pass.
- Desktop and mobile Chromium workflows pass without horizontal overflow.
- Export, import, backup, restore, authentication, cloud sync, deployment, and automatic Attempt creation remain deferred.
