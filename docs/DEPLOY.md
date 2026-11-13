# Deployment

## Local

Install Node.js 20.9+ (Node 22 LTS recommended), Corepack and Docker Compose. Then:

```sh
corepack pnpm install
docker compose up -d
cp .env.example .env.local
```

Set `SESSION_SECRET` to at least 32 random bytes (`openssl rand -base64 32`). Keep `.env.local` private. Then:

```sh
corepack pnpm db:migrate
corepack pnpm dev
```

The local default database URL is `postgresql://snaprelay:snaprelay@localhost:5434/snaprelay`. Compose maps host port 5434 to PostgreSQL's container port 5432 to avoid collisions with an existing local service. Change it if your database differs. To clean expired relay data, schedule `corepack pnpm db:cleanup` (e.g., daily); no scheduler is configured by this repository.

## Hosted

1. Provision PostgreSQL 15+ and a Node-compatible Next.js host such as Vercel or Railway.
2. Configure `DATABASE_URL`, a unique `SESSION_SECRET`, and `NEXT_PUBLIC_BASE_URL` in the host environment. Set the base URL to the deployed HTTPS origin. `ENABLE_VISION` and `DEMO_MODE` are currently unused/disabled.
3. Run `corepack pnpm db:migrate` from a secure environment that can reach the database.
4. Build and deploy with the host's supported Next.js workflow (`corepack pnpm build`, then provider deployment). Route handlers need the Node.js runtime and PostgreSQL network access.
5. Verify create/evolve/invite/claim/evolve in two fresh browser profiles. Confirm an old holder is read-only after refreshing.
6. Configure a scheduled job for `pnpm db:cleanup` and verify HTTPS camera permission and fallback behavior on mobile.

Camera use requires HTTPS outside localhost. Never commit production environment variables or enable untested vision. Configure a working PostgreSQL TLS URL according to the host; this app requires server-side pooling access.
