# Limitations

- The camera feature is a live camera background under a screen-positioned 3D character. It does not do device pose tracking, surface detection, occlusion, or native Lens behavior.
- Context selection is manual in this release. The UI labels it honestly. COCO-SSD/on-device recognition is not included.
- Invite preview/claim and relay state require PostgreSQL; the app has no fake in-memory collaboration mode.
- Expired relays are rejected on reads and writes. Cleanup is a manual scheduled task (`pnpm db:cleanup`) until an operator configures a scheduler.
- In-memory application rate limits are not used; a small PostgreSQL-backed window counter is used. Retention is limited by seven-day relay expiry and deletion, but expired rows remain until cleanup runs.
- A production deployment and physical-device smoke test require hosting credentials and an HTTPS domain. This repository does not assert a live deployment.
