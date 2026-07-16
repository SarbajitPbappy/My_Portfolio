-- ============================================
-- MEDIA STORAGE BUCKET
-- Run ONCE in the Supabase SQL Editor to enable the admin upload buttons for
-- BOTH the resume/CV (PDF) and the profile image.
-- ============================================

-- 1) Create a public bucket to hold uploaded media (resume PDF + profile image).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- 2) Anyone can read files (public "Download CV" link + profile image display).
drop policy if exists "Public read media" on storage.objects;
create policy "Public read media" on storage.objects
  for select using (bucket_id = 'media');

-- 3) Allow uploads / replacements into this bucket.
--    NOTE: the upload API routes (/api/resume/upload, /api/profile-image/upload)
--    are already protected by admin authentication in middleware.ts, so only the
--    logged-in admin can reach them.
drop policy if exists "Allow upload media" on storage.objects;
create policy "Allow upload media" on storage.objects
  for insert with check (bucket_id = 'media');

drop policy if exists "Allow update media" on storage.objects;
create policy "Allow update media" on storage.objects
  for update using (bucket_id = 'media') with check (bucket_id = 'media');
