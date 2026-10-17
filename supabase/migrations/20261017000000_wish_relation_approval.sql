-- TILA: the Wishing Wall's palm-leaf redesign.
-- Run after 20261013000000_tila.sql (safe to run more than once).
--
-- 1. A wish can say who the guest is to the couple (Family, Friend, Elder,
--    Colleague), shown as "ANANYA · FRIEND".
-- 2. New wishes wait for the couple: they arrive as 'pending' and appear on
--    the site only once the couple sets them to 'visible' (Supabase →
--    Table editor → wishes → status). Matches wishes.requireApproval = true
--    in src/config/wedding.ts.

alter table public.wishes
  add column if not exists relation text
  check (relation is null or char_length(btrim(relation)) between 1 and 40);

alter table public.wishes alter column status set default 'pending';

-- A guest can only ever add a pending wish; publishing is the couple's.
drop policy if exists "Guests can add wishes" on public.wishes;
create policy "Guests can add wishes"
  on public.wishes for insert to anon
  with check (status = 'pending');
