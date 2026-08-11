-- ============================================
-- ONE-OFF: remove the analytics rows created while building/verifying the
-- tracking feature. Paste into the Supabase SQL Editor and Run, then delete
-- this file — it is not part of the app.
-- ============================================

-- 1) Session detail from the verification runs.
DELETE FROM visitor_events WHERE session_id IN (
  'af2b273c-03ff-4f42-9824-7e6b26ce5b7a',
  'b520e25d-3feb-4426-9e56-cd52c162c7a7',
  'd3e2b033-2014-41d9-aa26-14d80ba66f11',
  '77281a54-c052-42de-a82b-f83e6bc1e1b8',
  'e2e-verify-1786464199',
  'deploy-probe-0001',
  'fallback-test-1234'
);

DELETE FROM visitor_sessions WHERE session_id IN (
  'af2b273c-03ff-4f42-9824-7e6b26ce5b7a',
  'b520e25d-3feb-4426-9e56-cd52c162c7a7',
  'd3e2b033-2014-41d9-aa26-14d80ba66f11',
  '77281a54-c052-42de-a82b-f83e6bc1e1b8',
  'e2e-verify-1786464199',
  'deploy-probe-0001',
  'fallback-test-1234'
);

-- Also clears anything left from later verification runs on the same day.
DELETE FROM visitor_events
WHERE session_id LIKE 'e2e-%' OR session_id LIKE 'deploy-probe-%'
   OR session_id LIKE 'beacon-probe-%' OR session_id LIKE 'fallback-test-%';
DELETE FROM visitor_sessions
WHERE session_id LIKE 'e2e-%' OR session_id LIKE 'deploy-probe-%'
   OR session_id LIKE 'beacon-probe-%' OR session_id LIKE 'fallback-test-%';

-- 2) Synthetic pageviews. The '/' hits from testing are indistinguishable from
--    real traffic and are deliberately left alone.
DELETE FROM page_views
WHERE path IN ('/probe', '/fallback-check') OR visitor_hash = 'probe';

-- ============================================
-- NUCLEAR OPTION (only if you want a completely fresh start and are willing to
-- lose the real visits recorded so far). Uncomment to use:
-- ============================================
-- TRUNCATE visitor_events, visitor_sessions;
-- TRUNCATE page_views;
