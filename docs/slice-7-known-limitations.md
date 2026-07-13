# Phase 3D Slice Seven Known Limitations

- Interpretation and Next-Test records remain browser-resident and origin-specific.
- Backup and migration controls remain deferred to Slice Eight.
- AI requests use only the normalized deterministic Comparison package; they do not inspect images, G-code, slicer files, printer telemetry, or external documents.
- Rules-based fallback remains available when Gemini is unavailable or its output fails validation.
- Conditional inferences and alternate explanations are hypotheses, not diagnoses.
- The product does not rank a root cause or provide confidence scores.
- The Next-Test Plan defaults to one primary variable but cannot ensure the user changes only that variable during the physical print.
- An accepted plan is linked to the latest compared Attempt; automatic child-Attempt creation remains deferred.
- When a deterministic Comparison is refreshed after Attempt changes, prior interpretation and linked Next-Test records are removed because they are no longer current.
- Full accessibility and cross-browser certification remain scheduled for Slice Nine. Slice Seven validates desktop and Pixel 7 Chromium workflows.
