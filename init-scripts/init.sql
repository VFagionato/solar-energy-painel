-- Initialize Solar Winds PostgreSQL Database
-- This script runs automatically when the container starts

\echo 'Creating Solar Winds Database...'

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'UTC';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE solarwinds TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO admin;

-- Create a health check table (this will be managed by TypeORM migrations in production)
-- This is just for initial database setup verification
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'healthy',
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version VARCHAR(20) DEFAULT '1.0.0'
);

-- Insert initial health check record
INSERT INTO health_check (status, version) VALUES ('healthy', '1.0.0') ON CONFLICT DO NOTHING;

-- Create indexes for better performance (TypeORM will create table structure)
-- These will be created when TypeORM synchronization runs

-- Add some useful functions for solar energy calculations
CREATE OR REPLACE FUNCTION calculate_efficiency(power_generated NUMERIC, max_capacity NUMERIC)
RETURNS NUMERIC AS $$
BEGIN
    IF max_capacity = 0 THEN
        RETURN 0;
    END IF;
    RETURN ROUND((power_generated / max_capacity) * 100, 2);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_daily_energy_summary(sensor_id UUID, target_date DATE)
RETURNS TABLE(
    total_energy NUMERIC,
    avg_power NUMERIC,
    max_power NUMERIC,
    min_power NUMERIC,
    event_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(e.power_generated), 0) as total_energy,
        COALESCE(AVG(e.power_generated), 0) as avg_power,
        COALESCE(MAX(e.power_generated), 0) as max_power,
        COALESCE(MIN(e.power_generated), 0) as min_power,
        COUNT(e.uuid) as event_count
    FROM events e 
    WHERE e.sensor_uuid = sensor_id 
    AND DATE(e.timestamp) = target_date;
END;
$$ LANGUAGE plpgsql;

\echo 'Solar Winds Database initialized successfully!'
\echo 'Database: solarwinds'
\echo 'User: admin'
\echo 'Extensions: uuid-ossp, pgcrypto'
\echo 'Functions: calculate_efficiency, get_daily_energy_summary'