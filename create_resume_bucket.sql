-- ============================================
-- RESUME / CV STORAGE BUCKET
-- Run ONCE in the Supabase SQL Editor to enable the
-- "Upload Resume (PDF)" button in the admin panel.
-- ============================================

-- 1) Create a public bucket to hold the resume PDF.
insert into storage.buckets (id, name, public)
values ('resume', 'resume', true)
on conflict (id) do update set public = true;

-- 2) Anyone can read the file (so the public "Download CV" link works).
drop policy if exists "Public read resume" on storage.objects;
create policy "Public read resume" on storage.objects
  for select using (bucket_id = 'resume');

-- 3) Allow uploads / replacements into this bucket.
--    NOTE: the upload API route (/api/resume/upload) is already protected by
--    admin authentication in middleware.ts, so only the logged-in admin can reach it.
drop policy if exists "Allow upload resume" on storage.objects;
create policy "Allow upload resume" on storage.objects
  for insert with check (bucket_id = 'resume');

drop policy if exists "Allow update resume" on storage.objects;
create policy "Allow update resume" on storage.objects
  for update using (bucket_id = 'resume') with check (bucket_id = 'resume');
