# Phase 3D Slice Four Known Limitations

- Planning records remain browser-resident and origin-specific.
- Backup and migration controls remain deferred to Slice Eight.
- A saved Plan belongs to one Attempt; duplication is not available until Slice Five.
- Outcome recording and plan-to-outcome lifecycle progression remain deferred to Slice Five.
- The standalone Quick Planner generates an unsaved draft unless the user begins from a saved Attempt.
- Source references are user-entered. PrintPal does not retrieve, open, validate, or fabricate technical documents.
- Output safety validation is intentionally conservative. Model output containing prescriptive operating values, unsafe procedural language, unsupported certification claims, or URLs is rejected in favor of the labeled deterministic fallback.
- User-entered exact technical values can be retained as record context, but PrintPal does not characterize them as universally correct.
- Gemini availability and model behavior may vary; deterministic fallback and user-authored planning remain the continuity controls.
- Full accessibility and cross-browser certification remain scheduled for Slice Nine. Slice Four tests desktop and mobile Chromium workflows.
