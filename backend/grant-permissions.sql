-- Grant all privileges to postgres user on all tables and sequences
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO postgres;

-- Verify grants
SELECT grantee, table_schema, table_name, privilege_type 
FROM information_schema.table_privileges 
WHERE grantee = 'postgres' AND table_schema = 'public' 
ORDER BY table_name 
LIMIT 10;
