# Phase 3D Slice Six Known Limitations

- Comparison records remain browser-resident and origin-specific.
- Backup and migration controls remain deferred to Slice Eight.
- Both Attempts must belong to the same Project, appear in its Attempt index, and have evaluated Outcomes.
- Attempts with `NOT_YET_EVALUATED` Outcomes cannot be compared until evaluation is recorded.
- Declared planned changes are preserved as user-entered evidence; deterministic matching identifies whether a changed field has a plausible recorded reference but does not prove intent or causation.
- Planned-change aggregation depends on valid stored parent relationships. Missing or cyclic lineage is surfaced as uncertainty rather than reconstructed by inference.
- Unexplained recorded changes are not diagnoses and do not prove that a change was accidental.
- Supported observations restate stored facts and do not establish causation.
- No model inference, alternate explanation, likely-cause ranking, or Next-Test recommendation is generated.
- The governed field set compares structured record fields and normalized lists; it does not semantically interpret freeform settings text.
- One unordered Attempt pair retains one Comparison identifier. If either Attempt changes, the deterministic facts are refreshed in place when the pair is compared again.
- The Comparison view does not permit users to overwrite stored Attempt facts. User annotation and AI interpretation remain deferred.
- Full accessibility and cross-browser certification remain scheduled for Slice Nine. Slice Six validates desktop and mobile Chromium workflows.
