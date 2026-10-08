begin;

  DO $$
  BEGIN
      IF NOT EXISTS (
          SELECT 1
          FROM pg_publication
          WHERE pubname = 'supabase_realtime'
      ) THEN
          CREATE PUBLICATION supabase_realtime;
      END IF;
  END
  $$;

  -- Add tables individually, ignoring if already there (actually ADD TABLE fails if already there)
  DO $$
  BEGIN
      BEGIN
          ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
      EXCEPTION WHEN duplicate_object THEN
          -- do nothing
      END;
      BEGIN
          ALTER PUBLICATION supabase_realtime ADD TABLE player_hands;
      EXCEPTION WHEN duplicate_object THEN
          -- do nothing
      END;
  END
  $$;

commit;
