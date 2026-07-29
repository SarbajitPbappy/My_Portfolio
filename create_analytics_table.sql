-- ============================================
-- SITE ANALYTICS (privacy-friendly visitor counting)
-- Run ONCE in the Supabase SQL Editor to enable the /admin -> Analytics tab
-- and the visitor counter in the site footer.
-- ============================================
--
-- Privacy model: no cookies, no IP addresses and no user agents are stored.
-- Each hit records only a SALTED HASH of (ip + user-agent), where the salt
-- rotates every UTC day (see lib/analytics.ts). That makes a visitor countable
-- within a day but not trackable across days, and the hash is not reversible
-- back to an IP.
--
-- Because the salt rotates daily, "unique visitors" over a multi-day range is
-- the SUM OF DAILY UNIQUES (the same convention Plausible/Fathom use), not a
-- count of distinct humans over the whole period.

-- ============================================
-- TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS page_views (
  id BIGSERIAL PRIMARY KEY,
  path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,            -- referring hostname only (e.g. "google.com"), NULL if direct
  visitor_hash TEXT NOT NULL,
  country TEXT,             -- 2-letter code from the CDN edge header, NULL if unknown
  device TEXT,              -- 'mobile' | 'tablet' | 'desktop'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Range scans (every dashboard query filters on created_at) and per-day grouping.
CREATE INDEX IF NOT EXISTS page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS page_views_visitor_idx ON page_views (visitor_hash);
CREATE INDEX IF NOT EXISTS page_views_path_idx ON page_views (path);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
-- The anon key ships in the browser bundle, so it is only allowed to INSERT
-- hits. There is deliberately NO select policy: raw rows are not readable with
-- the anon key. Every read below goes through a SECURITY DEFINER function that
-- returns aggregates only.

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert page_views" ON page_views;
CREATE POLICY "Allow insert page_views" ON page_views
  FOR INSERT WITH CHECK (true);

-- ============================================
-- AGGREGATE READ FUNCTIONS
-- ============================================
-- All aggregation happens in Postgres so the app never pulls raw hit rows.

-- All-time + today totals. Powers the public footer counter.
CREATE OR REPLACE FUNCTION analytics_summary()
RETURNS TABLE (
  total_views BIGINT,
  total_visitors BIGINT,
  today_views BIGINT,
  today_visitors BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*)::BIGINT,
    COUNT(DISTINCT visitor_hash)::BIGINT,
    COUNT(*) FILTER (WHERE created_at >= date_trunc('day', NOW()))::BIGINT,
    COUNT(DISTINCT visitor_hash) FILTER (WHERE created_at >= date_trunc('day', NOW()))::BIGINT
  FROM page_views;
$$;

-- Daily series for the last p_days days, zero-filled so gaps render as empty
-- columns instead of collapsing the time axis.
CREATE OR REPLACE FUNCTION analytics_daily(p_days INT DEFAULT 30)
RETURNS TABLE (
  day DATE,
  views BIGINT,
  visitors BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    d.day::DATE,
    COUNT(pv.id)::BIGINT,
    COUNT(DISTINCT pv.visitor_hash)::BIGINT
  FROM generate_series(
         date_trunc('day', NOW()) - ((GREATEST(p_days, 1) - 1) || ' days')::INTERVAL,
         date_trunc('day', NOW()),
         '1 day'::INTERVAL
       ) AS d(day)
  LEFT JOIN page_views pv
    ON pv.created_at >= d.day
   AND pv.created_at <  d.day + '1 day'::INTERVAL
  GROUP BY d.day
  ORDER BY d.day;
$$;

-- Most-visited paths in the window.
CREATE OR REPLACE FUNCTION analytics_top_paths(p_days INT DEFAULT 30, p_limit INT DEFAULT 8)
RETURNS TABLE (
  label TEXT,
  views BIGINT,
  visitors BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    path,
    COUNT(*)::BIGINT,
    COUNT(DISTINCT visitor_hash)::BIGINT
  FROM page_views
  WHERE created_at >= date_trunc('day', NOW()) - ((GREATEST(p_days, 1) - 1) || ' days')::INTERVAL
  GROUP BY path
  ORDER BY 2 DESC
  LIMIT GREATEST(p_limit, 1);
$$;

-- Where visitors came from. NULL referrer is reported as 'Direct'.
CREATE OR REPLACE FUNCTION analytics_top_referrers(p_days INT DEFAULT 30, p_limit INT DEFAULT 8)
RETURNS TABLE (
  label TEXT,
  views BIGINT,
  visitors BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(NULLIF(referrer, ''), 'Direct'),
    COUNT(*)::BIGINT,
    COUNT(DISTINCT visitor_hash)::BIGINT
  FROM page_views
  WHERE created_at >= date_trunc('day', NOW()) - ((GREATEST(p_days, 1) - 1) || ' days')::INTERVAL
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT GREATEST(p_limit, 1);
$$;

-- Device mix (mobile / tablet / desktop).
CREATE OR REPLACE FUNCTION analytics_devices(p_days INT DEFAULT 30)
RETURNS TABLE (
  label TEXT,
  views BIGINT,
  visitors BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(NULLIF(device, ''), 'unknown'),
    COUNT(*)::BIGINT,
    COUNT(DISTINCT visitor_hash)::BIGINT
  FROM page_views
  WHERE created_at >= date_trunc('day', NOW()) - ((GREATEST(p_days, 1) - 1) || ' days')::INTERVAL
  GROUP BY 1
  ORDER BY 2 DESC;
$$;

-- Top countries (populated only when the CDN sends a geo header).
CREATE OR REPLACE FUNCTION analytics_top_countries(p_days INT DEFAULT 30, p_limit INT DEFAULT 8)
RETURNS TABLE (
  label TEXT,
  views BIGINT,
  visitors BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COALESCE(NULLIF(country, ''), 'Unknown'),
    COUNT(*)::BIGINT,
    COUNT(DISTINCT visitor_hash)::BIGINT
  FROM page_views
  WHERE created_at >= date_trunc('day', NOW()) - ((GREATEST(p_days, 1) - 1) || ' days')::INTERVAL
  GROUP BY 1
  ORDER BY 2 DESC
  LIMIT GREATEST(p_limit, 1);
$$;

-- The app calls these with the anon key, so it needs EXECUTE on each.
GRANT EXECUTE ON FUNCTION analytics_summary() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_daily(INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_top_paths(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_top_referrers(INT, INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_devices(INT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION analytics_top_countries(INT, INT) TO anon, authenticated;

-- ============================================
-- OPTIONAL: retention
-- ============================================
-- page_views grows one row per hit. At portfolio traffic this is negligible,
-- but if you ever want to cap it, run this occasionally (or schedule it with
-- pg_cron) to drop hits older than one year:
--
--   DELETE FROM page_views WHERE created_at < NOW() - INTERVAL '365 days';
