-- Enable pg_cron (requires superuser, often allowed in Supabase if schema is extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;

-- Este job corre cada 15 minutos y borra las salas que lleven en el lobby más de 1 hora
SELECT cron.schedule(
  'cleanup-stale-rooms',
  '*/15 * * * *',
  $$
  DELETE FROM public.rooms 
  WHERE status = 'lobby' 
  AND updated_at < NOW() - INTERVAL '1 hour';
  $$
);
