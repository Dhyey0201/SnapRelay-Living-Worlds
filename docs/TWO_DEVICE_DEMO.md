# Two-device demo

1. Start PostgreSQL, migrate it and run the app (see [DEPLOY.md](DEPLOY.md)).
2. On Device A, open the HTTPS demo or `http://localhost:3000`, create Milo and evolve once with Coffee.
3. Tap **Pass to a friend**, then Share or copy the invitation link.
4. Open the link on Device B or in a separate browser profile. Review Milo's preview, enter an alias and accept.
5. Evolve Milo in Plant. The same character now keeps its coffee glow and gains leaves.
6. Refresh Device A. It should show Milo with the new holder, read-only controls and the shared journey.
7. Open Journey and tap chapters to inspect the stored 3D snapshots.

Use isolated cookie jars; opening the invite in the original session correctly refuses self-claim. Physical-device testing requires an HTTPS host. Camera permission is optional; use the labeled illustrated scene when unavailable. The automated Playwright scenario creates two independent browser contexts against the real app and PostgreSQL.
