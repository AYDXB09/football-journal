-- Let a competition carry a link to its official/external page (e.g. a federation's
-- competition listing) so match data entered can be cross-referenced against the
-- source, without having to hunt the link down again each time.
alter table public.competitions
  add column if not exists website text;
