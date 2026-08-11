-- ============================================
-- VISITOR SESSIONS + CLICK TRACKING
-- Run ONCE in the Supabase SQL Editor, AFTER create_analytics_table.sql.
-- Adds the per-visit detail behind /admin -> Analytics -> Visitors.
-- ============================================
--
-- This is a step beyond the aggregate counters: it records an individual
-- timeline per visit (when it started, how long it lasted, every page and
-- every click). It still stores no IP address, no user agent string and no
-- cookie -- a visit is keyed by a random session id held in sessionStorage,
-- and the visitor is the same daily-rotating salted hash used elsewhere.
--
-- Timestamps are stored in UTC (timestamptz). The admin UI renders them in
-- Asia/Dhaka; do not store local time here.

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS visitor_sessions (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  visitor_hash TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entry_path TEXT,
  referrer TEXT,
  country TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  screen TEXT,
  page_views INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS visitor_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  kind TEXT NOT NULL,          -- 'pageview' | 'click'
  path TEXT,
  label TEXT,                  -- visible text / aria-label of the clicked element
  target TEXT,                 -- tag#id of the element, for disambiguation
  href TEXT,                   -- link destination, when the element was a link
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  offset_ms BIGINT             -- milliseconds since the session started
);

CREATE INDEX IF NOT EXISTS visitor_sessions_started_idx ON visitor_sessions (started_at DESC);
CREATE INDEX IF NOT EXISTS visitor_sessions_visitor_idx ON visitor_sessions (visitor_hash);
CREATE INDEX IF NOT EXISTS visitor_events_session_idx ON visitor_events (session_id, occurred_at);
CREATE INDEX IF NOT EXISTS visitor_events_kind_idx ON visitor_events (kind, occurred_at DESC);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- Locked down completely: the anon key gets no direct INSERT and no SELECT on
-- either table. Writes go through analytics_ingest() and reads through the
-- aggregate functions below, all SECURITY DEFINER. This is stricter than
-- page_views (which needs a plain insert policy for the legacy /track route).

ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INGEST
-- ============================================
-- One round trip per batch: upserts the session, appends its events, mirrors
-- pageviews into page_views (so the existing counters and the footer keep
-- working), and bumps the counters.
--
-- occurred_at is derived server-side as started_at + offset_ms rather than
-- trusting a client clock, so a wrong or spoofed device clock cannot scatter
-- events across the timeline.

CREATE OR REPLACE FUNCTION analytics_ingest(p_payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id  TEXT := p_payload->>'session_id';
  v_visitor     TEXT := p_payload->>'visitor_hash';
  v_referrer    TEXT := NULLIF(p_payload->>'referrer', '');
  v_country     TEXT := NULLIF(p_payload->>'country', '');
  v_device      TEXT := NULLIF(p_payload->>'device', '');
  v_started     TIMESTAMPTZ;
  v_event       JSONB;
  v_kind        TEXT;
  v_path        TEXT;
  v_at          TIMESTAMPTZ;
  v_pageviews   INTEGER := 0;
  v_clicks      INTEGER := 0;
BEGIN
  IF v_session_id IS NULL OR v_visitor IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO visitor_sessions (
    session_id, visitor_hash, entry_path, referrer, country,
    device, browser, os, screen, started_at, last_seen_at
  )
  VALUES (
    v_session_id, v_visitor, p_payload->>'path', v_referrer, v_country,
    v_device, NULLIF(p_payload->>'browser', ''), NULLIF(p_payload->>'os', ''),
    NULLIF(p_payload->>'screen', ''), NOW(), NOW()
  )
  ON CONFLICT (session_id) DO UPDATE SET last_seen_at = NOW();

  SELECT started_at INTO v_started FROM visitor_sessions WHERE session_id = v_session_id;

  FOR v_event IN
    SELECT value FROM jsonb_array_elements(COALESCE(p_payload->'events', '[]'::JSONB))
  LOOP
    v_kind := v_event->>'kind';
    v_path := LEFT(COALESCE(v_event->>'path', ''), 200);
    v_at := v_started + (COALESCE((v_event->>'offset')::BIGINT, 0) * INTERVAL '1 millisecond');

    IF v_kind NOT IN ('pageview', 'click') THEN
      CONTINUE;
    END IF;

    INSERT INTO visitor_events (session_id, kind, path, label, target, href, occurred_at, offset_ms)
    VALUES (
      v_session_id, v_kind, v_path,
      LEFT(NULLIF(v_event->>'label', ''), 120),
      LEFT(NULLIF(v_event->>'target', ''), 120),
      LEFT(NULLIF(v_event->>'href', ''), 300),
      v_at,
      COALESCE((v_event->>'offset')::BIGINT, 0)
    );

    IF v_kind = 'pageview' THEN
      v_pageviews := v_pageviews + 1;

      -- Mirror into the aggregate table, deduped the same way the standalone
      -- /track route dedupes. Doing it here makes the window reliable across
      -- serverless instances, which an in-memory guard cannot be.
      IF NOT EXISTS (
        SELECT 1 FROM page_views
        WHERE visitor_hash = v_visitor
          AND path = v_path
          AND created_at > NOW() - INTERVAL '60 seconds'
      ) THEN
        INSERT INTO page_views (path, referrer, visitor_hash, country, device)
        VALUES (v_path, v_referrer, v_visitor, v_country, v_device);
      END IF;
    ELSE
      v_clicks := v_clicks + 1;
    END IF;
  END LOOP;

  IF v_pageviews > 0 OR v_clicks > 0 THEN
    UPDATE visitor_sessions
    SET page_views = page_views + v_pageviews,
        clicks = clicks + v_clicks
    WHERE session_id = v_session_id;
  END IF;
END;
$$;

-- ============================================
-- READ FUNCTIONS
-- ============================================

-- Recent visits, newest first. duration_seconds is wall-clock time between the
-- first and last signal received for the visit.
CREATE OR REPLACE FUNCTION analytics_sessions(p_days INT DEFAULT 7, p_limit INT DEFAULT 50)
RETURNS TABLE (
  session_id TEXT,
  started_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  duration_seconds INT,
  entry_path TEXT,
  referrer TEXT,
  country TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  screen TEXT,
  page_views INT,
  clicks INT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    s.session_id,
    s.started_at,
    s.last_seen_at,
    GREATEST(EXTRACT(EPOCH FROM (s.last_seen_at - s.started_at))::INT, 0),
    s.entry_path,
    s.referrer,
    s.country,
    s.device,
    s.browser,
    s.os,
    s.screen,
    s.page_views,
    s.clicks
  FROM visitor_sessions s
  WHERE s.started_at >= NOW() - ((GREATEST(p_days, 1)) || ' days')::INTERVAL
  ORDER BY s.started_at DESC
  LIMIT GREATEST(p_limit, 1);
$$;

-- Full timeline for one visit.
CREATE OR REPLACE FUNCTION analytics_session_events(p_session_id TEXT)
RETURNS TABLE (
  kind TEXT,
  path TEXT,
  label TEXT,
  target TEXT,
  href TEXT,
  occurred_at TIMESTAMPTZ,
  offset_ms BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT e.kind, e.path, e.label, e.target, e.href, e.occurred_at, e.offset_ms
  FROM visitor_events e
  WHERE e.session_id = p_session_id
  ORDER BY e.occurred_at ASC, e.id ASC
  LIMIT 500;
$$;

-- What people actually click, across all visits in the window.
CREATE OR REPLACE FUNCTION analytics_top_clicks(p_days INT DEFAULT 7, p_limit INT DEFAULT 10)
RETURNS TABLE (label TEXT, href TEXT, clicks BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(NULLIF(e.label, ''), COALESCE(NULLIF(e.target, ''), 'Unlabelled')),
    MAX(e.href),
    COUNT(*)::BIGINT
  FROM visitor_events e
  WHERE e.kind = 'click'
    AND e.occurred_at >= NOW() - ((GREATEST(p_days, 1)) || ' days')::INTERVAL
  GROUP BY 1
  ORDER BY 3 DESC
  LIMIT GREATEST(p_limit, 1);
$$;

-- Headline engagement numbers for the window.
CREATE OR REPLACE FUNCTION analytics_engagement(p_days INT DEFAULT 7)
RETURNS TABLE (
  sessions BIGINT,
  avg_duration_seconds INT,
  median_duration_seconds INT,
  avg_pages NUMERIC,
  total_clicks BIGINT,
  bounce_rate NUMERIC
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH s AS (
    SELECT
      GREATEST(EXTRACT(EPOCH FROM (last_seen_at - started_at))::INT, 0) AS secs,
      page_views,
      clicks
    FROM visitor_sessions
    WHERE started_at >= NOW() - ((GREATEST(p_days, 1)) || ' days')::INTERVAL
  )
  SELECT
    COUNT(*)::BIGINT,
    COALESCE(AVG(secs), 0)::INT,
    COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY secs), 0)::INT,
    ROUND(COALESCE(AVG(page_views), 0), 2),
    COALESCE(SUM(clicks), 0)::BIGINT,
    -- A bounce here is a visit with no second page AND no click at all.
    ROUND(
      COALESCE(
        100.0 * COUNT(*) FILTER (WHERE page_views <= 1 AND clicks = 0) / NULLIF(COUNT(*), 0),
        0
      ), 1)
  FROM s;
$$;

GRANT EXECUTE ON FUNCTION analytics_ingest(JSONB) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_sessions(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_session_events(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_top_clicks(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_engagement(INT) TO anon, authenticated;

-- ============================================
-- OPTIONAL: retention
-- ============================================
-- Event rows are the fastest-growing table here (one per click). To cap it:
--
--   DELETE FROM visitor_events   WHERE occurred_at < NOW() - INTERVAL '90 days';
--   DELETE FROM visitor_sessions WHERE started_at  < NOW() - INTERVAL '90 days';
