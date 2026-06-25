-- Flat SJI rate card: $35/hr, single Engineer role (no junior/senior tiers).
delete from rate_card;

insert into rate_card (role, hourly_rate) values
  ('Engineer', 35),
  ('Project Manager', 35),
  ('Designer', 35),
  ('QA', 35);
