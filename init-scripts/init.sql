-- Initialize Solar Winds PostgreSQL Database
-- This script runs automatically when the container starts

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Optional: Create additional schemas
-- CREATE SCHEMA IF NOT EXISTS app_schema;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE solarwinds TO admin;

-- Create a sample table (this will be managed by TypeORM migrations in production)
-- This is just for initial database setup verification
CREATE TABLE IF NOT EXISTS health_check (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'healthy',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy') ON CONFLICT DO NOTHING;