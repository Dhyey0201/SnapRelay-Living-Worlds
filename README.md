# SnapRelay: Living Worlds

An independent social AR experiment: one living character, many friends, evolving across their worlds.

**Live demo:** <https://snaprelay-khaki.vercel.app>

SnapRelay is a mobile-first web app for growing a shared 3D character and passing it between friends. The relay, character state, ownership and append-only timeline live in PostgreSQL. Guest sessions use opaque httpOnly cookies. Manual context selection is available in the core flow; camera mode is an optional camera-overlay preview, not spatial tracking or a Snapchat Lens.

## Requirements

- Node.js 20.9+ (Node 22 LTS recommended), Corepack and pnpm 10
- Docker Compose, or another PostgreSQL 15+ database

## Local development

```sh
corepack pnpm install
docker compose up -d
cp .env.example .env.local
# Replace SESSION_SECRET with: openssl rand -base64 32
corepack pnpm db:migrate
corepack pnpm dev
```

Open <http://localhost:3000>. Create a relay, evolve once, and pass it using the invitation link in a second browser profile. For camera access use localhost or an HTTPS deployment. The illustrated fallback works without a camera. If you enable the pnpm shim with `corepack enable`, you can omit `corepack` from the commands below.

## Quality checks

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm test:e2e
corepack pnpm build
```

End-to-end tests need a reachable PostgreSQL database and a migrated schema. Use two isolated browser contexts to exercise the actual cross-session flow. The Compose database uses host port 5434 to avoid conflicting with an existing local PostgreSQL service on 5432. `corepack enable` can add the `pnpm` command shim if you prefer shorter commands.

## Features

- Procedural Three.js/R3F Milo, with persistent context-driven traits.
- Deterministic evolution reducer; no external AI key or generated fake responses.
- Anonymous guest sessions, validated writes, row-locked transactions and request idempotency.
- Private one-use invitations, preview without transfer, atomic claim and server-enforced holder permissions.
- Participant-only history with selectable saved character snapshots.
- Seven-day relay expiry and a manual expiry cleanup task (`pnpm db:cleanup`).
- Optional camera-overlay preview; manual context is explicitly labeled.

## Docs

- [Two-device demo](docs/TWO_DEVICE_DEMO.md)
- [Deployment](docs/DEPLOY.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Limitations](docs/LIMITATIONS.md)
- [90-second demo script](docs/DEMO_SCRIPT_90_SECONDS.md)
- [Pitch one-pager](docs/PITCH_ONE_PAGER.md)

Independent AR product concept; not affiliated with Snap Inc.
