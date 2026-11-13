CREATE TABLE IF NOT EXISTS guests (
  id uuid PRIMARY KEY, session_token_hash text NOT NULL UNIQUE,
  display_name varchar(24) NOT NULL DEFAULT 'Friend', created_at timestamptz NOT NULL DEFAULT now(), last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS relays (
  id uuid PRIMARY KEY, creator_guest_id uuid NOT NULL REFERENCES guests(id), current_holder_guest_id uuid NOT NULL REFERENCES guests(id),
  name varchar(24) NOT NULL, personality varchar(16) NOT NULL, palette varchar(16) NOT NULL,
  status varchar(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD','INVITED','ARCHIVED')),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1), turn_number integer NOT NULL DEFAULT 1, last_evolution_turn integer NOT NULL DEFAULT 0,
  state_json jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);
CREATE INDEX IF NOT EXISTS idx_relays_expiry ON relays(expires_at);
CREATE TABLE IF NOT EXISTS relay_participants (
  relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE, guest_id uuid NOT NULL REFERENCES guests(id), alias varchar(24) NOT NULL, joined_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (relay_id, guest_id)
);
CREATE TABLE IF NOT EXISTS relay_events (
  id uuid PRIMARY KEY, relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE, sequence integer NOT NULL,
  actor_guest_id uuid NOT NULL REFERENCES guests(id), actor_alias varchar(24) NOT NULL, event_type varchar(24) NOT NULL,
  context_type varchar(16), context_source varchar(16), interaction varchar(16), evidence_json jsonb, delta_json jsonb,
  resulting_state_json jsonb NOT NULL, narrative varchar(300), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE (relay_id, sequence)
);
CREATE INDEX IF NOT EXISTS idx_relay_events_sequence ON relay_events(relay_id, sequence);
CREATE TABLE IF NOT EXISTS relay_invites (
  id uuid PRIMARY KEY, relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE, sender_guest_id uuid NOT NULL REFERENCES guests(id), token_hash text NOT NULL UNIQUE,
  status varchar(16) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','REDEEMED','CANCELLED','EXPIRED')),
  expires_at timestamptz NOT NULL, redeemed_by_guest_id uuid REFERENCES guests(id), redeemed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_relay_invite ON relay_invites(relay_id) WHERE status = 'PENDING';
CREATE TABLE IF NOT EXISTS mutation_requests (
  guest_id uuid NOT NULL REFERENCES guests(id), request_id uuid NOT NULL, relay_id uuid NOT NULL REFERENCES relays(id) ON DELETE CASCADE,
  operation varchar(32) NOT NULL, response_json jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (guest_id, request_id)
);
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, window_started_at timestamptz NOT NULL, count integer NOT NULL);
