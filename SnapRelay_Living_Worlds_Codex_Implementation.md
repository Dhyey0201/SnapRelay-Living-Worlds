# SnapRelay: Living Worlds
## Codex-ready implementation specification · Independent concept for Snapchat

**Document version:** 1.0  
**Prepared:** November 12, 2026  
**Owner / creator:** Dhyey Patel  
**Primary deadline:** Deliver a credible, shareable live prototype and a short pitch demo for November 13, 2026.  
**Primary audience:** OpenAI Codex acting as the implementation engineer; subsequently Snap hiring managers and AR / camera / AI engineering teams.  
**Project status:** Proposed; this document is a build specification, not evidence that the application is already implemented.

> **Codex mission:** Implement the highest-quality, *actually working* version of SnapRelay that can be demonstrated by two independent browser sessions or two phones. Prioritize the end-to-end social relay, persistent evolving character, and a polished interactive 3D experience over ambitious but unreliable extras. Do not generate a mock-only prototype and claim the backend or computer vision works. Implement, run, test, document, and fix. If blocked on credentials, complete all local functionality and clearly identify the external deployment step.

---

## 0. Instructions to Codex — READ FIRST

You are the lead full-stack and creative-engineering developer for this repository. You are **authorized to implement the project end to end** from this specification. Do not stop after scaffolding or offer only an implementation plan. Make sensible choices without repeatedly asking questions.

**Execution rules:**

1. Inspect the repository. If empty, scaffold it; if it already contains work, preserve and build on functional work.
2. Complete **P0 items first**, in the exact order defined in Section 11. Keep the app runnable at each checkpoint.
3. Use TypeScript throughout the app. Maintain type safety, clear modules, and input validation.
4. Confirm currently compatible dependency versions before pinning. Prefer stable libraries; do not use experimental React Three Fiber builds.
5. Build a real PostgreSQL-backed relay system; do not simulate collaboration in frontend local storage or with fake API responses.
6. The character must be **visually attractive** and **genuinely rendered in 3D**; build procedural geometry in React Three Fiber so there is no external asset or license blocker.
7. On-device computer vision is P1: add it *after* the core relay works. The manual context chooser is a legitimate fallback, but must be visibly labeled as manual.
8. Camera access is optional. If permission is denied or no webcam exists, the app must remain demonstrable using a scene backdrop. Do not silently claim the backdrop is a live AR feed.
9. For browser camera mode, label it honestly as **camera-overlay AR preview**; it is not device pose tracking, surface detection, or a native Snapchat Lens.
10. Write migration scripts, a `.env.example`, scripts for local development, automated tests, README, and a two-device demo guide.
11. Never fabricate FPS, latency, users, test passes, availability of Snap internal APIs, or video evidence. Record metrics only if actually measured.
12. Never call the project an official Snap product; use the footer: **“Independent AR product concept; not affiliated with Snap Inc.”**
13. Implement accessibility basics, empty/error/loading states, responsive mobile-first layouts, secure anonymous guest sessions, rate limits, and reasonable data expiry.
14. After each milestone run the relevant build, typecheck, lint, and tests. Fix errors before proceeding.
15. When time is constrained, **omit stretch features rather than compromising the working cross-device path**.

### Single source of truth for success

An evaluator can open the demo on Device A, create a character called **Milo**, evolve it in a coffee / book / plant setting, generate an invitation, open that invitation on Device B, claim Milo, evolve it again, and see the **same persisted character and the same append-only evolution history** from both devices. Device A must lose editing privileges after a successful transfer. That working sequence is more important than any supplementary AI or animation.

---

## 1. Product concept and why Snap might care

**One-line pitch:** *“What if a Snap could travel between friends and grow into a shared living memory?”*

SnapRelay lets friends collaboratively create and evolve one persistent augmented-reality character. Each person sees the same character in a different place. Nearby physical objects—such as a plant, book, or coffee mug—can affect the character's appearance, mood, and story. After an interaction, a friend passes the character to another friend. Everyone can view a timeline of what the group created together.

### Core differentiation

This is **not** simply a real-time multiplayer AR Lens, generic virtual pet, AI chatbot, photo filter, or turn-based game. The inventive combination to demonstrate is:

- **Asynchronous relay:** one shared character moves across people at different times.
- **One persistent identity:** a canonical server-side state, never independent clones.
- **Environment-conditioned evolution:** detected everyday objects (or transparent manual selection) trigger meaningful, visible changes.
- **Authored social history:** each handoff adds an immutable chapter and a shareable recap.
- **Real engineering:** versioned writes, concurrency protection, idempotency, cross-device consistency, and explicit user privacy controls.

Snap already has Connected Lenses, turn-based games, persistent storage tools, and AI creation features. **Do not claim that shared AR or turn-based experiences are new to Snap.** The proposed differentiation is this tightly connected product experience.

### Target demo user journey

1. Dhyey visits the mobile web demo, creates Milo, and enters the world preview.
2. Milo starts as a friendly lavender-blue creature, bouncing gently beside the user's camera view or background scene.
3. Dhyey clicks **Discover surroundings** (where supported) or selects **Coffee / Plant / Books / Tech** manually.
4. After Dhyey chooses an interaction, the creature performs a short animation, adds a visible trait, and gains a new story entry.
5. Dhyey taps **Pass to a friend**, copies or shares a unique link.
6. A friend opens the link in a separate browser profile/device and sees a non-spoiler preview of Milo's identity and journey.
7. The friend taps **Accept relay**, becomes the only user allowed to evolve Milo, then changes it in a different environment.
8. Both users see the updated timeline. Dhyey can watch/read the history but cannot evolve Milo while someone else holds it.
9. The app displays a polished visual **Journey recap** of the character's transformations and each friend's contribution.

**MVP success:** Steps 1–9 are functional with manual contexts and any ordinary modern browser. Working vision detection should add real context recognition but must never block the journey.

---

## 2. Non-goals and important platform limitations

### Explicitly out of scope for tomorrow's core build

- Integrating directly into Snapchat messages, contact lists, Memories, Bitmoji, or account identities.
- Claiming that this web experience is a published Snapchat Lens.
- Requesting or requiring proprietary Snap APIs, internal permissions, or restricted identifiers.
- Full real-world SLAM / plane detection / occlusion across all mobile browsers.
- Training a new image recognition model or generating an arbitrary textured 3D animal with an LLM.
- Social graph recommendations, video calls, payments, advertising, analytics at scale, or public content discovery.
- Unmoderated user-uploaded 3D meshes, photos, or free-form public messaging.
- Fully automatic video recap rendering as a gate to project completion.

### Browser AR truthfulness

Camera mode = a **live camera feed** under a transparent Three.js canvas with a character positioned in display coordinates. This can look delightful and works on a wide range of browsers, but without real camera pose / hit testing it must **not** be described as persistent physical anchoring. For an actual Snapchat AR Lens, plan a later Lens Studio implementation or Camera Kit integration with approved access. A handoff across users persists the *character state*, not a single shared physical world coordinate system.

### External prerequisites

- Node.js stable LTS, pnpm, Docker (for local PostgreSQL), and Git.
- For a public demo: a web deployment and PostgreSQL host, such as Vercel + Neon or a managed Postgres deployment with Railway. Credentials / account setup may require human action.
- HTTPS is required for camera use on deployed sites (localhost is treated as a secure development context by browsers).
- **No OpenAI/Anthropic API key is needed for P0.** Keep deterministic evolution and story generation working without any secret.
- Snap Camera Kit access and Lens Studio publishing are **optional later steps**, not required for tomorrow's deploy.

---

## 3. Technology choices (keep this stack unless it is truly blocked)

| Layer | Choice | Reason |
|---|---|---|
| Full-stack app | Next.js App Router + React + TypeScript | One deployable app for site and API |
| UI styling | Tailwind CSS + a small set of original components | Fast, responsive, consistent visuals |
| 3D rendering | Three.js + `@react-three/fiber` + stable `@react-three/drei` | Real character rendered entirely in code |
| Motion/UI | CSS animations; Framer Motion / Motion only if compatible | Polished transitions without overengineering |
| Backend | Next.js route handlers, Node.js runtime | Simple deployment and sharing |
| Database | PostgreSQL + `pg` (node-postgres) | Reliable transactions and SQL for cross-device ownership |
| Schema/migrations | Versioned SQL migrations and `scripts/migrate.ts` | Transparent schema; no ORM generation dependency |
| Validation | Zod | Runtime validation on all write requests |
| Guest authentication | Random opaque session cookie, hashed DB token | No signup friction, secure per-device control |
| Object detection (P1) | `@tensorflow/tfjs` + `@tensorflow-models/coco-ssd` | Client-side recognition of cup/book/potted plant/laptop |
| Testing | Vitest + Playwright | Unit, API, and two-session end-to-end verification |
| DB local | Docker Compose PostgreSQL | Reproducible local setup |
| Deploy | Managed Next.js + managed PostgreSQL | Stable HTTPS link for hiring-team demo |

Use versions that install cleanly together on the current stable Node LTS. If a dependency is unavailable or incompatible, use the nearest stable alternative, update README, and do not let a nonessential dependency block P0.

### Suggested commands

```bash
# Scaffold if repo is empty
pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --use-pnpm

# 3D, validation, Postgres
pnpm add three @react-three/fiber @react-three/drei pg zod
pnpm add -D @types/three @types/pg tsx vitest @playwright/test

# P1, only after P0 functions and ships
pnpm add @tensorflow/tfjs @tensorflow-models/coco-ssd
```

Use deployment-specific instructions from the provider's current documentation rather than hard-coding a dated CLI syntax.

---

## 4. Required routes and screens

### `/` — Home / product pitch

- Premium, minimal, playful landing experience, yellow accent without official Snap logos or wordmarks.
- Main headline: **“Your friend sends you a moment. You make it a story.”**
- Live animated 3D Milo hero, **Create a Relay**, **View How It Works**, and a small demo preview.
- A three-step panel: **Create → Evolve → Pass On**.
- A small disclosure: independent concept; no affiliation with Snap.
- Mobile friendly; under 3 seconds to meaningful noncamera rendering on typical broadband is a *target*, not a claimed result.

### `/create` — Create character

- Name field default `Milo`, max 24 characters; creator alias field default `You`, max 24.
- Choice of 3 palette presets; character personality selection `Curious`, `Playful`, `Calm`.
- 3D live preview reacts to palette choice and taps.
- Button **Bring Milo to Life** calls real API and navigates to relay view.
- Guard duplicate clicks and show a friendly retry state.

### `/r/[relayId]` — Relay world

- Live camera-background toggle with a clear permission prompt; no automatic camera start before user action.
- Transparent Three.js character overlay; fallback illustrated background when camera blocked.
- Character name, current level, current holder / waiting state, evolution chapter, and small status indicator.
- Entry interaction choices: `Explore`, `Play`, `Rest`. Select a *single* action for each turn.
- Environment recognition button **Scan surroundings**; auto-detect result with label and confidence, plus manual dropdown `Coffee`, `Plant`, `Books`, `Tech`, `Neutral`.
- Action preview that says **“Milo might grow a leaf / earn glasses / glow warmly…”** before commit.
- **Evolve Milo** calls backend and displays celebratory morph / particles on success.
- **Pass to a friend** available to holder after an evolution; copy/share invitation modal, with expiration warning.
- Buttons **Journey** and **View recap**.
- When user is not current holder, show read-only world plus **“Milo is exploring with another friend.”** Editing buttons are disabled and server authorization enforces it.
- Loading, expired, invalid, network error, and transfer conflict states.

### `/join` — Invitation recipient

- Reads invite token from URL fragment `#t=...` (not a query parameter).
- Calls a POST preview endpoint using that opaque token; never shows token in screen UI.
- Preview card showing creature name, current visual trait count, chapters and sender alias.
- Explains **“You'll become the next holder. Your friend can still follow Milo's journey.”**
- An alias input and **Accept relay** button. A preview page alone never claims ownership.
- After accept, transfer ownership atomically and navigate to `/r/[relayId]`.
- Handle expired/previously redeemed/invite cancelled clearly; no silent transfer.
- Remove URL fragment after securely copying the token into in-memory state; do not log it.

### `/r/[relayId]/journey` — Evolution timeline and recap

- Horizontal or vertical timeline with chapters ordered by server sequence number.
- For every evolution: actor alias, context source (`Object detected` vs `Chosen by user`), relevant environment, action, visual trait gained, timestamp, short templated story line.
- Character stage snapshots computed from stored event result. When a user selects a timeline step, 3D character visually updates to that stage.
- Hero recap: **“Milo has traveled through N chapters with M friends.”**
- Render a clean recap card suitable for screenshot and social sharing; a **Copy journey link** action. If export image can be implemented reliably, include it, but do not make it required.
- A **Delete my relay** or **Delete relay** affordance for the creator; if implemented for MVP, apply server authorization, cascade delete, and confirm action.

### `/demo` — Guided fast demo (optional P1)

- Explains how to test on two browsers, without using fake data for the actual main flow.
- Link to create an actual relay; optionally seed a demo relay behind a `DEMO_MODE` environment flag.
- Do not enable impersonation of other people's production sessions just to make the demo look easy.

---

## 5. Visual design and 3D character requirements

### Visual direction

A *delightful consumer-camera experience*, not a typical SaaS admin dashboard. Use rich charcoal (`#121212`), warm off-white (`#FAF8F1`), bright yellow (`#FFE93B`), lavender (`#9385E9`), and mint (`#7AD6B0`) as an independent visual identity. Avoid Snap's official logos, Bitmoji likenesses, proprietary assets, or trademarked UI replicas.

- Bold headline; soft rounded surfaces and subtle shadows.
- Camera world is full-screen on mobile with overlays respecting iOS safe areas.
- Visible animated 3D character in the first viewport of the landing page.
- Buttons must be comfortably tappable; aim for >=44px touch targets.
- Use semantic labels, focus states, reduced-motion preference, accessible contrast, and friendly empty/error copy.
- Small delight: animated glowing trails, springing ear/antenna, tiny confetti for evolution, a pleasant handoff animation.
- Provide a static graceful fallback for WebGL failure.

### Milo procedural model (no downloadable licensed assets)

Build Milo out of reusable Three.js meshes and materials:

- Main rounded blob / capsule with `meshStandardMaterial`, subtle specular highlight, and color driven by state.
- Two oversized expressive eyes with small white specular dots; soft smile; gentle blush dots.
- Two tiny ears or antennae and simple hands / feet.
- Fake/contact shadow under character; slight idle bounce; gentle head turn following pointer position; blink every few seconds.
- Optional leaf sprouts, round glasses, orbiting stars, and warm steam / pixel particles generated procedurally.
- Three expressions: `curious`, `delighted`, `sleepy` (facial changes and idle animation).
- Avoid using expensive shaders or dozens of animated lights that will tank mobile performance.

### Distinct visible evolution states

| Context | COCO-SSD evidence | Visual evolution | Story cue |
|---|---|---|---|
| Coffee | `cup` | Warm amber glow, tiny rising steam | Milo discovered a cozy coffee break |
| Plant | `potted plant` | Mint leaf sprouts; greener body accent | Milo found a little garden |
| Books | `book` | Tiny round glasses, orbiting star | Milo discovered a new story |
| Tech | `laptop` | Pixel aura / small visor | Milo learned a new trick |
| Neutral | no detection or manual fallback | Ribbon or sparkles | Milo collected a new memory |

Object detection can be wrong. Show editable selection before evolution. If a user manually picks `Plant`, store evidence `manual`; never relabel the action as an AI-detected plant.

---

## 6. Core data model and database schema

Use PostgreSQL as the source of truth. Keep simple SQL migrations in `db/migrations/`. All timestamps are UTC `timestamptz`. Use opaque UUIDs for internal IDs; public relay IDs should be unpredictable. Never expose session tokens, invitation token hashes, or database connection strings in client payloads.

### Tables

#### `guests`

```sql
CREATE TABLE guests (
  id uuid PRIMARY KEY,
  session_token_hash text NOT NULL UNIQUE,
  display_name varchar(24) NOT NULL DEFAULT 'Friend',
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
```

`guests` represent anonymous browser sessions. Generate a cryptographically random 32-byte session token and store only its SHA-256 hash. Store the raw token solely in a secure, httpOnly, SameSite=Lax cookie. Set Secure in production. A user opening a link in a different browser creates a distinct guest.

#### `relays`

```sql
CREATE TABLE relays (
  id uuid PRIMARY KEY,
  creator_guest_id uuid NOT NULL REFERENCES guests(id),
  current_holder_guest_id uuid NOT NULL REFERENCES guests(id),
  name varchar(24) NOT NULL,
  personality varchar(16) NOT NULL,
  palette varchar(16) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'HELD',
  version integer NOT NULL DEFAULT 1,
  turn_number integer NOT NULL DEFAULT 1,
  last_evolution_turn integer NOT NULL DEFAULT 0,
  state_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  CONSTRAINT relay_status_check CHECK (status IN ('HELD','INVITED','ARCHIVED')),
  CONSTRAINT relay_version_check CHECK (version >= 1)
);
CREATE INDEX idx_relays_expiry ON relays(expires_at);
```

`state_json` is a cached, validated canonical projection. Its updates and its event log must be committed in the same database transaction.

#### `relay_participants`

```sql
CREATE TABLE relay_participants (
  relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE,
  guest_id uuid NOT NULL REFERENCES guests(id),
  alias varchar(24) NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (relay_id, guest_id)
);
```

#### `relay_events`

```sql
CREATE TABLE relay_events (
  id uuid PRIMARY KEY,
  relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE,
  sequence integer NOT NULL,
  actor_guest_id uuid NOT NULL REFERENCES guests(id),
  actor_alias varchar(24) NOT NULL,
  event_type varchar(24) NOT NULL,
  context_type varchar(16),
  context_source varchar(16),
  interaction varchar(16),
  evidence_json jsonb,
  delta_json jsonb,
  resulting_state_json jsonb NOT NULL,
  narrative varchar(300),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (relay_id, sequence)
);
CREATE INDEX idx_relay_events_sequence ON relay_events(relay_id, sequence);
```

Allowed event types: `CREATED`, `EVOLVED`, `INVITED`, `TRANSFERRED`, `INVITE_CANCELLED`, `INVITE_EXPIRED`. State progression is verifiable from ordered events. Do not store raw camera frames, face embeddings, full photos, GPS, or contacts.

#### `relay_invites`

```sql
CREATE TABLE relay_invites (
  id uuid PRIMARY KEY,
  relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE,
  sender_guest_id uuid NOT NULL REFERENCES guests(id),
  token_hash text NOT NULL UNIQUE,
  status varchar(16) NOT NULL DEFAULT 'PENDING',
  expires_at timestamptz NOT NULL,
  redeemed_by_guest_id uuid REFERENCES guests(id),
  redeemed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT invite_status_check CHECK (status IN ('PENDING','REDEEMED','CANCELLED','EXPIRED'))
);
CREATE UNIQUE INDEX idx_one_active_relay_invite
ON relay_invites(relay_id) WHERE status = 'PENDING';
```

Expired `PENDING` records must be marked `EXPIRED` inside the locked transaction before a replacement invite is created. If the relay is still `INVITED`, restore it to `HELD` and append an `INVITE_EXPIRED` event in that same transaction (advancing the version), then validate the new invite request against the reconciled version. The UI should display `Invite expired — create a fresh link`, not trap the user in a permanent waiting state. This prevents the partial unique index from blocking a valid replacement invite.

#### `mutation_requests` (write idempotency)

```sql
CREATE TABLE mutation_requests (
  guest_id uuid NOT NULL REFERENCES guests(id),
  request_id uuid NOT NULL,
  relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE,
  operation varchar(32) NOT NULL,
  response_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (guest_id, request_id)
);
```

Use this table for EVOLVE, INVITE, CLAIM, and CANCEL mutations. If the same request is sent twice, return the previously committed response; never generate two events. Add a migration for any necessary new columns, rather than silently changing the persisted schema.

### Canonical character JSON (validate with Zod)

```json
{
  "schemaVersion": 1,
  "name": "Milo",
  "level": 1,
  "experience": 0,
  "bodyHue": 252,
  "sizeScale": 1.0,
  "mood": "curious",
  "leafCount": 0,
  "orbitingStars": 0,
  "glasses": false,
  "steamAura": false,
  "pixelAura": false,
  "ribbonCount": 0,
  "visitedContexts": [],
  "lastContext": "NEUTRAL"
}
```

Keep quantities bounded, e.g., `leafCount` <= 3, `orbitingStars` <= 4, `sizeScale` <= 1.4. Do not allow arbitrary client-provided character state to be written to the database.

### Retention / privacy

- Each relay expires after 7 days, shown in the UI. API reads return `410 RELAY_EXPIRED` for expired relays; mutations reject them.
- Implement a creator-authorized delete endpoint and cascade cleanup, if feasible in P0.
- Add a cleanup script or scheduled task for expired relays. If automatic scheduling is not configured, document that the script must be run and do not claim auto-deletion already operates.
- Do not retain camera images; infer locally, send only a whitelisted context label, source, and optional detector confidence/label.

---

## 7. API contract (all writes validated and authenticated by guest cookie)

All API responses follow:

```json
{ "ok": true, "data": {} }
```

Errors follow:

```json
{
  "ok": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Milo changed on another device. Refresh to continue."
  }
}
```

Use `Cache-Control: no-store` for private state responses and `runtime = 'nodejs'` for API handlers accessing PostgreSQL. Version IDs returned to clients MUST match committed versions.

### `POST /api/session`

- Initialize / refresh anonymous guest cookie.
- Request: `{ "displayName": "Dhyey" }` optional; sanitize and truncate per schema.
- Returns `{ guestId, displayName }`, but never the session token.
- Idempotent when a valid cookie already exists.

### `POST /api/relays`

- Creates a guest-owned character.
- Body: `{ "name":"Milo", "personality":"CURIOUS", "palette":"LAVENDER", "alias":"Dhyey" }`.
- Server sets canonical starting state and CREATION event within one transaction; event sequence 1; relay version 1.
- Returns `{ relayId, version:1, state, permissions:{canEvolve:true,canInvite:false}, createdAt }`.
- Only session cookie identifies creator; never accept `creatorId` from frontend.

### `GET /api/relays/:relayId`

- Available only to participants (creator and successfully joined friends); 404 for unknown/nonparticipant relay IDs.
- Returns relay state, version, status, holder alias, permissions (`canEvolve`, `canInvite`, `canCancelInvite`, `canDelete`), event count, expiry.
- No private invite token or session hash is returned.
- `canEvolve` requires `status=HELD`, current holder, and `last_evolution_turn < turn_number`.
- `canInvite` requires current holder, `status=HELD`, and evolution completed for current turn. Creator must first evolve before inviting.
- Allow polling every 3–5 seconds, plus manual refresh; only refetch while screen active.

### `POST /api/relays/:relayId/evolve`

Body:

```json
{
  "requestId": "5d9ee3af-cb23-4ab6-80c0-54f42e11025b",
  "expectedVersion": 1,
  "interaction": "EXPLORE",
  "context": "COFFEE",
  "contextSource": "DETECTED",
  "evidence": { "objectLabel": "cup", "confidence": 0.82 }
}
```

- Valid interactions: `EXPLORE`, `PLAY`, `REST`.
- Valid contexts: `COFFEE`, `PLANT`, `BOOKS`, `TECH`, `NEUTRAL`.
- Valid context sources: `DETECTED`, `MANUAL`; if DETECTED, require a recognized allowlisted object label and a plausible confidence in `[0,1]` (still *client-reported*, not security evidence).
- Validate holder, turn limit, version, and expiry server-side. Lock relay row via `SELECT ... FOR UPDATE` and use a transaction.
- Invoke **pure deterministic state reducer**, not LLM-generated arbitrary JSON. Build resulting state, short narrative, delta metadata, and a new EVOLVED event. Update relay version and `last_evolution_turn` transactionally.
- Return `{ relayId, version, state, event, permissions }`.
- Duplicate requestId -> original response; different requestId at same prior version -> `409 VERSION_CONFLICT` or `409 ALREADY_EVOLVED_THIS_TURN`.

### `POST /api/relays/:relayId/invites`

Body: `{ "requestId":"uuid", "expectedVersion":2 }`.

- Holder must have evolved this turn; status must be `HELD`.
- Generate an unpredictable 32-byte-equivalent invite token as `base64url(HMAC-SHA256(SESSION_SECRET, 'invite:v1:' + relayId + ':' + requestId + ':' + senderGuestId))`. Require a cryptographically random UUIDv4 `requestId` from the client. The keyed HMAC construction permits **reconstructing the same token on an authenticated identical request retry without storing the plaintext token**; store **only SHA-256(token)** in `relay_invites`. Never expose `SESSION_SECRET` to clients. Do not use `Math.random()`.
- Invite expires in 24 hours or on relay expiry, whichever is earlier.
- Set relay `status=INVITED`; log event and advance version in one transaction.
- Return invite URL `https://your-domain/join#t=<token>` after a successful creation. For a repeat with identical `requestId`, validate it is the same sender/relay/operation, reconstruct the HMAC token from the same input, and return the same link while the invite remains pending; **do not store the raw token or full link in `mutation_requests.response_json`**. For this operation, persist metadata only (invite ID, relay ID, operation status and version) to support safe retry. Never put raw invitation in ordinary logs or analytics.
- If the current invitation has expired, reconcile it as described in Section 6 in the same locked transaction before issuing a fresh one. Expose its expiry to the holder so the client can offer **Create new link**. Reject a stale `expectedVersion` with a refresh-required response after reconciliation rather than silently applying an unexpected new version.
- While invite pending, holder cannot evolve or send another invite.
- `navigator.share` on supported mobile browsers, `navigator.clipboard.writeText` otherwise, with successful copy feedback and manual select fallback.

### `POST /api/invites/preview`

Body: `{ "token":"opaque-base64url" }`.

- Token is passed in JSON (not URL query), hashed server-side and looked up by constant-time-safe comparison where practical.
- Verify pending state and expiration; no ownership transfer.
- Returns minimal card `{ relayName, previewState, senderAlias, chapterCount, expiresAt }`.
- Do not disclose participant IDs, complete private history, or raw invitation token in response.
- Rate limit invalid token probes; avoid differentiating existing UUIDs from secret token validity in excessive detail.

### `POST /api/invites/claim`

Body: `{ "token":"opaque-base64url", "alias":"Friend B", "requestId":"uuid" }`.

Within a single transaction:
1. Look up invite by token hash and lock invite + relay in a consistent order; check expiry, `PENDING`, and relay `INVITED`.
2. Reject creator/holder self-claim, or provide an explicit self-claim cancellation path; do not silently transfer to the same session.
3. Create or update relay participant for the claiming guest.
4. Set `current_holder_guest_id` = claimer and increment `turn_number`, set `status=HELD`, advance relay version.
5. Set invite `REDEEMED`, record redemption and TRANSFERRED event.
6. Commit once. Return `{ relayId, version, state, permissions }`.

Only one claimant succeeds. Any concurrent second claim gets `409 INVITE_ALREADY_USED` and does not change history. If a request is retried by the same claimant with the same requestId, return the prior committed response.

### `POST /api/relays/:relayId/invites/cancel`

- Holder who issued pending invite may cancel while it is unclaimed. Lock row, mark invite cancelled, restore `HELD`, log `INVITE_CANCELLED`, increment version.
- Return updated relay state.

### `GET /api/relays/:relayId/events`

- Participant-only; ascending sequence.
- Return each event's safe fields and resulting character state to support recap playback.
- Store aliases as display labels; HTML escape on render. Server still validates all text.

### `DELETE /api/relays/:relayId`

- Creator-only, confirmed in UI. Delete relay and all dependent entries in a transaction. Return 204.
- If held by a friend, deletion should still make subsequent links return 404; show clear client error.

### API security invariants

- Verify session cookie on every protected API call. Never accept guest IDs as authority from user input.
- Validate all body fields using Zod. Reject oversized JSON and unknown fields.
- Ensure `relayId` is valid UUID; generic 404 on inaccessible IDs.
- Rate limit session creation and write endpoints. A PostgreSQL-based limiter is preferred for a multi-instance deployment; if time forces an in-memory limiter, document that it is not distributed and do not claim production-grade protection.
- Use security headers, restrict cross-origin write requests, and never use permissive wildcard CORS. SameSite cookies + explicit origin checking on mutating requests.
- Use appropriate referrer policy; no third-party analytics on the invitation page.
- Do not use unsafe arbitrary HTML rendering for stories or aliases.

---

## 8. Evolution engine — deterministic, tested, genuinely visible

Implement `src/lib/engine/evolve.ts` as a **pure function**:

```ts
type EvolutionInput = {
  state: CharacterState;
  context: 'COFFEE' | 'PLANT' | 'BOOKS' | 'TECH' | 'NEUTRAL';
  interaction: 'EXPLORE' | 'PLAY' | 'REST';
  chapter: number;
  actorAlias: string;
};

type EvolutionResult = {
  nextState: CharacterState;
  delta: CharacterDelta;
  narrative: string;
  effectKey: string;
};

function evolveCharacter(input: EvolutionInput): EvolutionResult;
```

### State rules

- Increase `experience` by a deterministic amount based on interaction (e.g., Explore +20; Play +15; Rest +10).
- `level = 1 + floor(totalExperience / 30)` with a visual cap on scale; cap numerical values.
- PLANT -> `leafCount += 1` up to 3; gradually greener accent and relaxed mood.
- BOOKS -> `glasses=true` and `orbitingStars +=1` up to 4.
- COFFEE -> `steamAura=true`, slightly warmer body accent and delighted mood.
- TECH -> `pixelAura=true`; add subtle orbiting pixels.
- NEUTRAL -> `ribbonCount +=1` up to 3, small sparkles.
- `interaction` modifies animation and story wording, while `context` controls main visual trait.
- Store `lastContext` and add to unique `visitedContexts`; do not erase older traits on a later change.
- Compose narrative from trusted templates only; use actor alias as escaped plain text.
- All results bounded and reproducible with same input. Absolutely no reliance on `Math.random()` for persisted evolution.

### Example expected output

Input: Milo at level 1, context PLANT, action EXPLORE, chapter 2.

Output: Milo gains a visible mint leaf, `leafCount=1`, XP increased, event narrative roughly: **“Milo discovered a tiny garden with Priya and grew its first leaf.”**

### Visual consistency requirements

The UI must respond to stored state, not separate ephemeral state. When Device B evolves Milo, Device A's read-only view must show B's changes after refresh/polling. Selecting event 1 in recap must render event 1's `resulting_state_json`, not the current character with a cosmetic label.

---

## 9. On-device environment detection (P1, not a release blocker)

Use COCO-SSD in the browser. Load TensorFlow and model lazily **only after** the user taps **Scan surroundings**. Do not download model weights on every page view. Use one captured frame from the video element and a visible spinner; avoid a continuous high-rate inference loop.

Pipeline:

```text
User taps Scan
      ↓
Browser camera frame in memory (not uploaded)
      ↓
COCO-SSD detections: label, confidence
      ↓
Whitelist mapping to context
      ↓
Show “I found: a cup (82%) → Coffee”
      ↓
User confirms or edits context
      ↓
Evolve request sends context + evidence metadata, never the image
```

### Object mapping

```ts
const objectToContext = {
  'cup': 'COFFEE',
  'potted plant': 'PLANT',
  'book': 'BOOKS',
  'laptop': 'TECH'
} as const;
```

Algorithm:

1. Filter detections to allowlist labels and confidence >= 0.55 (tunable; don't report as validated benchmark).
2. Pick highest confidence; resolve ties deterministically.
3. Present explanation, confidence, and a **Change** button.
4. If none found or model fails, explicitly say **“I couldn't confidently identify an object. Choose a setting.”** and offer manual contexts.
5. If user overrides, `contextSource='MANUAL'` even if a model ran.
6. If camera is blocked, model can't load, or browser/WebGL doesn't support it, manual context still works.
7. Do not analyze children, faces, people, or sensitive categories. No face recognition, no raw frame storage or logging.

**Important honesty:** Detection of a cup/book/plant/laptop is object detection, not full understanding of the user's entire environment. Copy should say **“Recognizes a few objects around you”**, not “understands your entire room.”

---

## 10. Architecture, state boundaries, and repository structure

### Architecture diagram

```text
Phone A/browser A                        Phone B/browser B
┌─────────────────────────┐              ┌─────────────────────────┐
│ Next.js React UI        │              │ Next.js React UI        │
│ getUserMedia + 3D Milo  │              │ getUserMedia + 3D Milo  │
│ optional local detector │              │ optional local detector │
└────────────┬────────────┘              └────────────┬────────────┘
             │ HTTPS + cookie                          │ HTTPS + cookie
             └──────────────────┬─────────────────────┘
                                ▼
                  ┌──────────────────────────┐
                  │ Next.js API route layer  │
                  │ Zod, session, auth,      │
                  │ transactions, rate limit│
                  └─────────────┬────────────┘
                                ▼
                  ┌──────────────────────────┐
                  │ PostgreSQL               │
                  │ relays + guests + invites│
                  │ append-only events       │
                  │ write idempotency        │
                  └──────────────────────────┘
```

### Suggested tree

```text
snaprelay/
├── README.md
├── AGENTS.md                     # concise Codex priorities; generated from this spec
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── next.config.ts
├── playwright.config.ts
├── vitest.config.ts
├── db/
│   └── migrations/
│       └── 001_initial.sql
├── scripts/
│   ├── migrate.ts
│   ├── cleanup-expired.ts
│   └── smoke-test.ts
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── create/page.tsx
│   │   ├── join/page.tsx
│   │   ├── r/[relayId]/page.tsx
│   │   ├── r/[relayId]/journey/page.tsx
│   │   └── api/
│   │       ├── session/route.ts
│   │       ├── relays/route.ts
│   │       ├── relays/[relayId]/route.ts
│   │       ├── relays/[relayId]/evolve/route.ts
│   │       ├── relays/[relayId]/events/route.ts
│   │       ├── relays/[relayId]/invites/route.ts
│   │       ├── relays/[relayId]/invites/cancel/route.ts
│   │       ├── invites/preview/route.ts
│   │       └── invites/claim/route.ts
│   ├── components/
│   │   ├── character/Milo3D.tsx
│   │   ├── character/CharacterAccessories.tsx
│   │   ├── camera/CameraStage.tsx
│   │   ├── camera/SceneFallback.tsx
│   │   ├── world/WorldControls.tsx
│   │   ├── world/ContextSelector.tsx
│   │   ├── world/EvolutionCelebration.tsx
│   │   ├── relay/ShareInviteModal.tsx
│   │   ├── recap/JourneyTimeline.tsx
│   │   └── ui/...
│   ├── lib/
│   │   ├── db/pool.ts
│   │   ├── db/queries.ts
│   │   ├── auth/guest-session.ts
│   │   ├── engine/schema.ts
│   │   ├── engine/evolve.ts
│   │   ├── engine/narratives.ts
│   │   ├── relay/transactions.ts
│   │   ├── security/rate-limit.ts
│   │   ├── vision/detect.ts
│   │   ├── api/client.ts
│   │   └── api/responses.ts
│   └── styles/...
├── tests/
│   ├── unit/evolve.test.ts
│   ├── integration/relay-transactions.test.ts
│   └── e2e/relay-journey.spec.ts
└── docs/
    ├── TWO_DEVICE_DEMO.md
    ├── ARCHITECTURE.md
    ├── LIMITATIONS.md
    ├── DEPLOY.md
    ├── PITCH_ONE_PAGER.md
    └── DEMO_SCRIPT_90_SECONDS.md
```

Feel free to use idiomatic Next.js route organization; the **behavior** and security invariants matter more than the exact names.

### Persistence / versioning mechanics

- Every mutation runs in a PostgreSQL transaction.
- Lock the relay with `SELECT ... FOR UPDATE` before validating version and applying changes.
- Read participant and invite records in a consistent lock order to avoid deadlocks.
- Use a monotonically increasing relay `version` on every committed mutation and event `sequence` for history order.
- Insert immutable event and update `state_json` atomically.
- Use `requestId` for exactly-once *effect* under request retries (idempotency). Exact-once network delivery is not promised.
- Ensure pending invitation is single-use and at most one active at a time.
- Return `409` and refetch on stale version. **Never blindly overwrite the server's state with a stale client copy.**
- History is participant-readable even when someone else is holder.

---

## 11. Implementation plan and priorities (STOP scope creep)

### P0 — A credible deployable demo; do these first

**Checkpoint P0.1 — scaffolding / dev environment**

- [ ] App starts with `pnpm dev` on a clean checkout.
- [ ] `docker compose up -d` starts local PostgreSQL.
- [ ] `.env.example` covers `DATABASE_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_BASE_URL`, and optional flags.
- [ ] `pnpm db:migrate` applies versioned schema (safe to rerun).
- [ ] Landing + create screens have high-quality responsive design and procedural Milo preview.
- [ ] `pnpm lint` and `pnpm typecheck` pass.

**Checkpoint P0.2 — persistent model and one-browser interaction**

- [ ] Anonymous guest session persists across refresh and is properly httpOnly.
- [ ] Create Milo -> real row in Postgres -> navigate to `/r/[id]`.
- [ ] Live character matches canonical `state_json` from API.
- [ ] Choose manual context + action -> evolve once -> DB transaction -> visible trait change.
- [ ] Refresh shows same trait and chapter; does not reset.
- [ ] Journey page lists real saved events and renders correct historical snapshots.
- [ ] Unit tests for evolution and authorization pass.

**Checkpoint P0.3 — real device-to-device relay (MOST IMPORTANT)**

- [ ] Generate a cryptographically secure one-time invitation.
- [ ] Receiver can preview without claiming; clicking Accept claims.
- [ ] Receiver can evolve Milo on a different guest session.
- [ ] Original guest becomes read-only, including if they manipulate the UI or call the endpoint directly.
- [ ] Event history stays intact and ordered on both devices.
- [ ] Double accept, duplicate evolve, expired invite, and stale version are handled without data corruption.
- [ ] Two independent Playwright browser contexts complete the main flow.

**Checkpoint P0.4 — presentation quality / deploy**

- [ ] Mobile-friendly world screen has convincing camera overlay and polished no-camera fallback.
- [ ] Share / copy flow works on iOS/Android browsers when supported.
- [ ] Reduced-motion support and good loading/error states exist.
- [ ] Deploy a working HTTPS instance if credentials / deployment environment are available.
- [ ] Run a real two-device smoke test; if physical devices unavailable, test two isolated browser contexts and document that limitation.
- [ ] Provide screenshots or recording instructions; never say media was recorded if it was not.
- [ ] Generate README, 90-second demo script, architecture diagram, and one-page pitch.

### P1 — Add polish and real on-device intelligence AFTER P0

- [ ] Lazy-load COCO-SSD after explicit user action.
- [ ] Detect cup, plant, book, laptop from a single camera frame where supported.
- [ ] Confirm or override inferred context.
- [ ] Gracefully handle camera permission denial, model loading failure, unsupported browser.
- [ ] Journey recap transitions between saved 3D stages with camera pan / character morph.
- [ ] Measure and display honest client-side frame timing in a development-only diagnostics overlay.
- [ ] Small handoff animation and celebratory confetti.

### P2 — Stretch; do NOT block deadline

- [ ] Export recap as an image or video.
- [ ] Optional server-side LLM storytelling behind an env flag, strict structured response validation, safe fallback.
- [ ] Higher fidelity character animations, audio, haptics.
- [ ] True spatial anchoring via approved Camera Kit / Lens Studio integration.
- [ ] Friend groups, richer narrative branches, multiple species.
- [ ] Real-time push updates (polling is adequate for async MVP).

### Strict project-management rule

If P0.3 is incomplete, do **not** work on P1. The memorable demonstration is a real character passing from one person to another, not the number of AI API calls or ornamental features.

---

## 12. Detailed tests and acceptance criteria

### Unit test matrix

1. PLANT evolution increments leaves and visible trait without exceeding cap.
2. BOOKS adds glasses, COFFEE adds steam, TECH adds pixels, NEUTRAL adds ribbon.
3. Same input produces byte-for-byte equivalent canonical `nextState` and delta.
4. State schema rejects unbounded trait counts, invalid mood, malformed names.
5. Once-per-turn evolution logic is enforced by server transaction.
6. Narrative contains only trusted templates and escaped alias data.
7. Version advances monotonically and matches highest committed event sequence by design.
8. Projection from ordered events matches the cached current `state_json`.
9. Expired relay disallows writes and returns appropriate expiry error.
10. Manual context never carries an `AI detected` badge.

### Integration test matrix (real test PostgreSQL)

1. Create new session and relay; fetch as owner succeeds.
2. Fetch as unrelated guest fails without leaking state.
3. EVOLVE changes stored state and appends exactly one event.
4. Repeat same `requestId` yields same committed result and one event.
5. Two concurrent evolve calls with same expectedVersion produce exactly one success.
6. INVITE only allowed for holder after evolution; returns a one-time link.
7. PREVIEW does not grant edit or change holder.
8. CLAIM atomically changes ownership; previous holder loses rights.
9. Two concurrent claims yield one winner and one `409`, with no duplicate transfer event.
10. Expired / cancelled / reused links fail; cancellation returns holder to `HELD`.
11. Nonparticipant and nonholder API mutations return `403`/`404` as appropriate.
12. Creator delete removes relay and dependent events / invitations.

### Playwright E2E acceptance flow

**Scenario A — Two friends:**

- Use BrowserContext A with fresh cookies; create Milo; evolve in Coffee.
- Click Share; capture invitation URL.
- Use BrowserContext B with fresh cookies; open invitation; inspect preview; claim.
- B evolves in Plant, which adds a leaf and preserves coffee trait.
- A refreshes; sees the same Milo as read-only; timeline has creation/evolution/transfer/evolution.
- Attempt POST evolve from A and verify authorization refusal.

**Scenario B — Conflict:**

- Two independent claim requests simultaneously against same invite; one succeeds; second fails; holder and event list correct.

**Scenario C — Camera/vision fallback:**

- Deny camera permission; fallback renders and manual Books evolution still works.

### Definition of Done

A claim of **“MVP complete”** is permitted only if:

- Fresh install scripts are documented and executable.
- P0.1–P0.4 are demonstrably implemented (deployment may be explicitly blocked by missing account credentials).
- Lint, typecheck, unit tests, and core E2E tests pass with recorded output.
- At least one live two-session relay succeeds against the real backend.
- Demo page and README describe actual implemented features truthfully.
- No secrets committed; an `.env.example` is provided.

**Honest failure handling:** If deploy or real physical-device validation is not possible, report exactly which steps passed, which did not, and include reproducible instructions for finishing. A local demo is better than a fake production URL.

---

## 13. Deployment and launch checklist

### Environment variables

```dotenv
# Local development example; replace secrets for production
DATABASE_URL=postgresql://snaprelay:snaprelay@localhost:5432/snaprelay
SESSION_SECRET=CHANGE_ME_TO_32_PLUS_RANDOM_BYTES
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
ENABLE_VISION=true
DEMO_MODE=false
```

Generate `SESSION_SECRET` using a cryptographically secure generator. Add `.env*` secrets to `.gitignore`, except `.env.example`. Never send real credentials to an LLM or commit them.

### Local runbook

```bash
pnpm install
docker compose up -d
cp .env.example .env.local
# edit .env.local (at least SESSION_SECRET)
pnpm db:migrate
pnpm dev

# In separate terminal, after app available:
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
```

### Production runbook

1. Provision PostgreSQL (e.g., Neon or Railway) and a deployed Next.js application with HTTPS (e.g., Vercel or Railway).
2. Set `DATABASE_URL`, `SESSION_SECRET`, and `NEXT_PUBLIC_BASE_URL` in provider environment settings. Set `ENABLE_VISION=true` only after tested.
3. Apply SQL migrations using a secure deployment step / CLI with DB access.
4. Deploy and verify no Node-specific packages are bundled into client code.
5. Create a new relay on the production URL, evolve it, and use a second browser profile or physical phone to claim and evolve it.
6. Confirm HTTPS camera permission prompt and fallback behavior on mobile.
7. Confirm response security headers, cookie Secure flag, rate-limits, and no secret logs.
8. Confirm database retention/deletion handling and identify whether cleanup is actually scheduled.
9. Keep a last-known-good deployment; do not change dependencies immediately before the pitch.
10. Record a working 60–90 second demo video after validation, if recording is available.

### Performance targets (targets, NOT claims)

- Interactive fallback stage: <= 3 seconds on a typical recent laptop/mobile device over normal network conditions.
- Responsive 3D Milo: target >= 30 FPS on a midrange phone, with adaptive particle budgets.
- Evolution write end-to-end: target < 800 ms p95 on a warm, nearby deployment (measure before citing).
- Invite transfer: no duplicated ownership event under concurrency.
- Object detection: only when explicitly requested, never continuous background analysis.

Only publish measured numbers with environment, sample count, date, and method. If not measured, omit the number from public pitch materials.

---

## 14. Product and engineering storytelling for Snap

### What to communicate

**Problem:** Most camera shares are individual, transient artifacts. Friends can react or remix, but the proposed experience asks whether a persistent character can become a shared evolving memory across different contexts and time zones.

**Solution:** A relay-based AR character that evolves when each recipient interacts with their surroundings, keeping one persistent identity and an authored timeline.

**Engineering highlight:** Deterministic 3D evolution; privacy-preserving local object detection; server-authoritative state machine; exactly-once mutation *effect* through idempotency; single-use capability invites; consistent history across independent clients.

**Product bet:** Collaboration might encourage friends to reopen the experience to discover what changed. This is a hypothesis; do not claim validated retention or Snapchat roadmap fit without evidence.

**What makes it worth discussing:** It uses known primitives (AR, lightweight vision, backend persistence) to explore a different kind of social creative artifact. Position it as an exploratory concept, not an internal product proposal already approved by Snap.

### Competitive honesty

Snap supports Connected Lenses, turn-based games, and persistent Lens data. What is being pitched here is **the integrated persistent AI-evolving social creature experience** with an emphasis on environmental context and shared history. Do **not** write “Snap has nothing like this” or “first-ever collaborative AR.” Better: **“I built an independent prototype exploring an asynchronous, environment-aware evolution layer on top of the kind of shared AR experiences Snap is known for.”**

### Suggested repository tagline

`An independent social AR experiment: one living character, many friends, evolving across their worlds.`

### Suggested 90-second demo script (must be adjusted to actual implementation)

**0–10 seconds — Hook:** “A Snap can capture a moment. What if the moment could change as it travels between friends?” Show animated Milo on the landing page.

**10–25 seconds — Create:** Open creation flow. Name Milo. Start camera overlay, or show the clearly labeled scene fallback. Milo idles in 3D.

**25–40 seconds — First evolution:** Choose Coffee (or detect a real cup with on-device object recognition, only if tested). Trigger Explore; Milo gets a warm glow. Show saved journey event.

**40–60 seconds — Handoff:** Click Pass to friend; copy link; open it in a second device / separate browser context; accept. Emphasize the same creature, not a second independent instance.

**60–75 seconds — Shared growth:** Friend selects Plant and evolves Milo. Milo gains leaf sprouts and preserves the earlier coffee trait. On original session show read-only state after transfer.

**75–85 seconds — History:** Open timeline, scrub between previous stages, show a single collective story.

**85–90 seconds — Engineering:** “The interesting part is the canonical state, one-time handoff, idempotent evolution engine, and on-device vision. I built this as an independent Snap-inspired product experiment.”

### Suggested brief outreach text

> Hi [Name], I built SnapRelay, a small social AR experiment where a character passes between friends, evolves from their surroundings, and keeps a shared journey. I made a live two-device prototype rather than just a mockup. I'd love to share the 90-second demo and hear what your team thinks. I'm finishing my MS at ASU this December and exploring early-career software / AI engineering roles at Snap. Demo: [verified URL] · GitHub: [verified URL]

**Use that outreach only after** the features you describe have been validated. If object detection or a public link is not working, edit the wording to match reality.

---

## 15. Later Snap-native integration plan (not for P0)

Snap Lens Studio 5.24.x supports Connected Framework for multiplayer and provides templates and persistence tools for Snapchat Lenses. Snap Camera Kit can host a Lens in a third-party web or native application but requires developer setup / access. This first web prototype is specifically designed not to depend on those approvals.

Potential native path:

1. Install Lens Studio and recreate Milo using optimized Lens meshes, animation, and scripting.
2. Validate whether the desired asynchronous shared-state workflow is best implemented using Lens Cloud storage/remote services or an external backend; don't assume a real-time multiplayer session automatically supports an asynchronous multi-day relay.
3. Implement secure backend endpoints subject to official Lens Studio networking capabilities and domain policies.
4. Test Lens asset size, platform compatibility, tracking, performance, behavior on different devices, and moderation requirements.
5. Publish the Lens only after satisfying Lens Studio review and account access requirements.
6. If Camera Kit approval is available, integrate with the official SDK and choose Lens versions supported on the target platform.

**Do not have Codex invent a published Lens ID, working Camera Kit token, Snap authorization integration, or an internal Snapchat feature flag.**

### Official and technical references (verify current compatibility before implementation)

- Snap Lens Studio download/release notes: https://ar.snap.com/download
- Snap mobile Lens games and turn-based features: https://ar.snap.com/games
- Snap Camera Kit overview and access: https://ar.snap.com/blog/snap-camera-kit-ar-sdk
- Snap official React Camera Kit wrapper: https://github.com/Snapchat/react-camera-kit
- React Three Fiber docs: https://r3f.docs.pmnd.rs/getting-started/installation
- Browser getUserMedia / HTTPS requirement: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- Node-postgres official guide: https://node-postgres.com/
- PostgreSQL row locking: https://www.postgresql.org/docs/current/explicit-locking.html
- Next.js documentation: https://nextjs.org/docs
- Playwright documentation: https://playwright.dev/docs/intro
- TensorFlow.js COCO-SSD model repository: https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd

---

## 16. FINAL CODEX RUN COMMAND / PROMPT

Copy the following block into Codex after placing this file in the repository root:

```text
Read SnapRelay_Living_Worlds_Codex_Implementation.md completely and treat it as the implementation contract.

Build SnapRelay: Living Worlds from scratch in this repository. Implement the actual working product, not a design mockup. Prioritize P0.1 -> P0.2 -> P0.3 -> P0.4, and only then add P1 if time/resources permit.

Critical outcome: two independent browser/device sessions must create, evolve, transfer, and evolve the SAME persistent 3D character through a secure one-time link. The original holder loses editing permissions after transfer. Show the real server-backed evolution journey, with deterministic traits and a polished visual character.

Use Next.js + TypeScript + React Three Fiber + PostgreSQL. Make the local build work with Docker Compose. Implement secure guest sessions, Zod validation, server-authoritative transaction/state machine, row locks, version conflicts, and idempotency. No mock collaboration, no fake results, no private Snap APIs, no external AI key required.

Use a gorgeous mobile-first visual design with a fully procedural cute 3D character. Provide an honest camera-overlay preview with a camera-disabled fallback. Add on-device COCO-SSD only after cross-device P0 is robust; manual contexts remain the reliable fallback.

Implement and run tests. Fix failures. Create README, .env.example, migration scripts, AGENTS.md, docs/TWO_DEVICE_DEMO.md, docs/ARCHITECTURE.md, docs/DEPLOY.md, docs/LIMITATIONS.md, docs/DEMO_SCRIPT_90_SECONDS.md, and docs/PITCH_ONE_PAGER.md. Don't claim completed tests/deployment without verifying them. Report exactly what works, what is blocked, and the commands I should run.

Start coding now; do not stop after planning.
```

### Codex deliverable checklist before declaring success

- [ ] Real `pnpm dev` works.
- [ ] Fresh database setup / migration works.
- [ ] End-to-end user journey works from two isolated browsers.
- [ ] Authentic persistent events and state are visible after refresh.
- [ ] Server rejects stale or unauthorized mutations.
- [ ] Beautiful 3D Milo with visible context-based evolution.
- [ ] Manual fallback works with blocked camera.
- [ ] Vision mode, if delivered, is true model inference and transparently labeled.
- [ ] Unit, integration, and E2E tests run; outcomes documented.
- [ ] README, deploy instructions, 90-second script, and one-pager exist.
- [ ] A live HTTPS URL exists *only if actually deployed and verified*.
- [ ] Scope/deployment limitations are stated honestly.

**End of implementation specification.**
