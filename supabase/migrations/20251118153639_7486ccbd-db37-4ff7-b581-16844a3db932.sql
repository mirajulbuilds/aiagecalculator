-- Enable pg_net extension for HTTP requests from database triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage permissions to necessary roles
GRANT USAGE ON SCHEMA net TO postgres, authenticated, service_role;