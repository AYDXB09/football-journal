-- ============================================================
-- Storage Buckets
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('club-logos', 'club-logos', true),
  ('player-avatars', 'player-avatars', true),
  ('player-photos', 'player-photos', true)
on conflict (id) do nothing;

-- ============================================================
-- Storage Policies
-- ============================================================

-- club-logos: authenticated users can read, player can upload to own folder
create policy "Anyone authenticated can read club logos"
  on storage.objects for select
  using (bucket_id = 'club-logos' and auth.role() = 'authenticated');

create policy "Player can upload club logos"
  on storage.objects for insert
  with check (bucket_id = 'club-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Player can update own club logos"
  on storage.objects for update
  using (bucket_id = 'club-logos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Player can delete own club logos"
  on storage.objects for delete
  using (bucket_id = 'club-logos' and auth.uid()::text = (storage.foldername(name))[1]);

-- player-avatars
create policy "Anyone authenticated can read avatars"
  on storage.objects for select
  using (bucket_id = 'player-avatars' and auth.role() = 'authenticated');

create policy "Player can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'player-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Player can update own avatar"
  on storage.objects for update
  using (bucket_id = 'player-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Player can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'player-avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- player-photos
create policy "Anyone authenticated can read player photos"
  on storage.objects for select
  using (bucket_id = 'player-photos' and auth.role() = 'authenticated');

create policy "Player can upload own photos"
  on storage.objects for insert
  with check (bucket_id = 'player-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Player can update own photos"
  on storage.objects for update
  using (bucket_id = 'player-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Player can delete own photos"
  on storage.objects for delete
  using (bucket_id = 'player-photos' and auth.uid()::text = (storage.foldername(name))[1]);
