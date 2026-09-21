-- The teammates table let a player store another child's phone, email, and
-- Instagram handle for the @mention feature, but the actual @mention UI
-- (Setup page's teammate form) never collected or used any of these three —
-- only name, nickname, positions, and kit_number were ever written. Storing
-- unused columns shaped like a third party's (often another minor's)
-- personal contact info, entered without that person's or their guardian's
-- consent, is a real privacy liability with no product benefit. Removed.
alter table public.teammates
  drop column if exists phone,
  drop column if exists email,
  drop column if exists instagram_handle;
