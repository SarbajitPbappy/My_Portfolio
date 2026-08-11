-- ============================================
-- ONE-OFF CLEANUP
-- Removes the analytics rows created while building and verifying visitor
-- tracking. Paste into the Supabase SQL Editor, Run, then delete this file —
-- it is not part of the app.
-- ============================================
--
-- Checked before writing this: every row in visitor_sessions was created during
-- the verification runs (all within one hour, all from a headless browser at
-- 800x600). No real visitor sessions existed yet, so clearing these two tables
-- loses nothing.

TRUNCATE TABLE visitor_events;
TRUNCATE TABLE visitor_sessions;

-- page_views is older and DOES contain real traffic, so only the two clearly
-- synthetic paths are removed. A handful of '/' hits from testing cannot be
-- told apart from real visits and are deliberately left in place.
DELETE FROM page_views
WHERE path IN ('/probe', '/fallback-check') OR visitor_hash = 'probe';

-- ============================================
-- FRESH START (optional)
-- ============================================
-- Only if you also want to reset the headline counters and the footer number,
-- discarding the real visits recorded so far. Uncomment to use:
--
-- TRUNCATE TABLE page_views;
