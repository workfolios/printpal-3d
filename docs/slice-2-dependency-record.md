# Phase 3D Slice Two Dependency Record

## Runtime Dependencies

- `dexie` — typed IndexedDB abstraction and transaction support.
- `dexie-react-hooks` — reserved for reactive repository hooks in the Record Library slice; no UI hook is introduced in Slice Two.

## Development Dependency

- `fake-indexeddb` — in-memory IndexedDB implementation for repository and transaction tests.

## Dependency Boundary

Slice Two does not add a hosted database SDK, authentication library, global state framework, router, cloud-sync service, or deployment dependency.
