# Phase 3D Slice Five Known Limitations

- Outcome summaries are user-authored; AI-assisted Outcome summarization is not included.
- Outcome Capture uses explicit save rather than background draft persistence while the form is incomplete.
- Duplicated source references are embedded copies; a standalone source library is not introduced.
- A duplicated Attempt intentionally starts without a Plan so the new Attempt cannot silently reuse prior planning claims or origin metadata.
- Inherited and changed indicators cover the editable duplication fields; deterministic whole-record comparison begins in Slice Six.
- Attempt History supports selection but not comparison.
- Browser-resident storage, backup risk, and origin dependence remain unchanged.
