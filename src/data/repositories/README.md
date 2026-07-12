# PrintPal 3D Data Repositories

Repository classes are the only approved application-facing entry point for local record access. UI components must not call Dexie tables directly. Multi-record operations belong in `src/data/transactions.ts` so they can be committed or rolled back atomically.
