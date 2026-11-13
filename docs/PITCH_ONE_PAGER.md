# SnapRelay — Living Worlds

**What if a Snap could travel between friends and grow into a shared living memory?**

SnapRelay is an independent web prototype exploring an asynchronous, environment-aware evolution layer on top of the kind of shared AR experiences Snap is known for. Friends create one persistent character, add moments to its story and pass it along. Each recipient sees the same 3D character and the same ordered history.

## Product bet

Everyday settings can become authored social memories when they change a character that friends share. Whether that leads people to return is a hypothesis; this prototype does not claim validated retention or a Snap roadmap fit.

## Engineering

- PostgreSQL canonical state with versioned row-locked writes.
- Deterministic character reducer and append-only snapshots.
- Anonymous guest sessions, idempotent mutations and one-time invite capability links.
- Procedural React Three Fiber character and a transparent manual context fallback.

## Honest scope

This is not an official Snap product, a native Snapchat Lens, device pose tracking, or a vision-enabled release. The camera option is a camera-overlay preview. Snap's internal APIs and accounts are not used.

**Independent AR product concept; not affiliated with Snap Inc.**
