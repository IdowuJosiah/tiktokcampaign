alter type mission_status add value if not exists 'rejected';

alter table missions
  add column if not exists rejection_reason text,
  add column if not exists rejected_at timestamptz;

notify pgrst, 'reload schema';
