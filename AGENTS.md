# SnapRelay implementation priorities

- Keep the cross-device relay backed by PostgreSQL; never simulate state or ownership in local storage.
- Mutations must validate input, authenticate by the httpOnly guest cookie, lock the relay, check version/holder/expiry, and commit state plus immutable event together.
- Do not expose session tokens, invite tokens (outside the one-time link), or token hashes in responses/logs.
- Evolve only through the deterministic reducer in `src/lib/engine/evolve.ts`.
- Manual context selection must say it is manual. Camera mode is a camera-overlay preview, not tracking or a Snapchat Lens.
- Keep the app responsive and accessible. Honor reduced motion. Preserve the independent-concept disclosure.
- Run lint, typecheck, unit tests and the cross-browser E2E flow after changes; report results accurately.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
