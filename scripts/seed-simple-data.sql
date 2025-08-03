-- Simple and Reliable Solar Winds Database Seeding Script
-- This version focuses on creating data that definitely works

\echo 'Starting simple Solar Winds database seeding...'

-- Clear existing data
DELETE FROM events;
DELETE FROM sensors;
DELETE FROM users;
DELETE FROM addresses;

\echo 'Creating addresses...'

-- Insert addresses
INSERT INTO addresses (uuid, user_uuid, sensor_uuid, street, number, city, state, zipcode, country) VALUES
-- User addresses
(gen_random_uuid(), NULL, NULL, 'Rua das Flores', '123', 'São Paulo', 'SP', '01234-567', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Avenida Paulista', '1000', 'São Paulo', 'SP', '01310-100', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Rua Oscar Freire', '456', 'São Paulo', 'SP', '01426-001', 'Brasil'),
-- Equipment addresses
(gen_random_uuid(), NULL, NULL, 'Fazenda Solar Norte', 'KM 10', 'Ribeirão Preto', 'SP', '14000-000', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Parque Solar Central', 'Lote 5', 'Campinas', 'SP', '13000-000', 'Brasil');

\echo 'Creating users...'

-- Create users and link to addresses
WITH user_addresses AS (
    SELECT uuid as address_uuid, ROW_NUMBER() OVER (ORDER BY created_at) as rn
    FROM addresses
    WHERE user_uuid IS NULL
    LIMIT 3
),
new_users AS (
    INSERT INTO users (uuid, name, last_name, document, address_uuid)
    SELECT 
        gen_random_uuid(),
        user_data.name,
        user_data.last_name,
        user_data.document,
        user_addresses.address_uuid
    FROM (
        VALUES 
            ('João', 'Silva', '123.456.789-01'),
            ('Maria', 'Santos', '234.567.890-12'),
            ('Pedro', 'Oliveira', '345.678.901-23')
    ) AS user_data(name, last_name, document)
    JOIN user_addresses ON user_addresses.rn = (
        CASE user_data.name 
            WHEN 'João' THEN 1
            WHEN 'Maria' THEN 2
            WHEN 'Pedro' THEN 3
        END
    )
    RETURNING uuid, address_uuid
)
-- Update addresses to reference users
UPDATE addresses SET user_uuid = new_users.uuid
FROM new_users
WHERE addresses.uuid = new_users.address_uuid;

\echo 'Creating sensors...'

-- Create farm sensors
INSERT INTO sensors (uuid, code, equip_address_uuid, total_events, angle, power_generate, last_shutdown, total_shutdown, user_uuid)
SELECT 
    gen_random_uuid(),
    'SOLAR-FARM-' || LPAD(equipment_data.rn::text, 3, '0'),
    equipment_data.address_uuid,
    0,
    equipment_data.angle,
    equipment_data.power_generate,
    NULL,
    0,
    NULL
FROM (
    SELECT 
        a.uuid as address_uuid,
        ROW_NUMBER() OVER (ORDER BY a.created_at DESC) as rn,
        (180.0 + (RANDOM() * 90 - 45))::numeric(5,1) as angle,
        (600.0 + (RANDOM() * 400))::numeric(10,1) as power_generate
    FROM addresses a
    WHERE a.user_uuid IS NULL
    LIMIT 2
) equipment_data;

-- Create home sensors
INSERT INTO sensors (uuid, code, equip_address_uuid, total_events, angle, power_generate, last_shutdown, total_shutdown, user_uuid)
SELECT 
    gen_random_uuid(),
    'SOLAR-HOME-' || LPAD(user_data.rn::text, 3, '0'),
    user_data.address_uuid,
    0,
    user_data.angle,
    user_data.power_generate,
    NULL,
    0,
    user_data.user_uuid
FROM (
    SELECT 
        u.uuid as user_uuid,
        u.address_uuid,
        ROW_NUMBER() OVER (ORDER BY u.created_at) as rn,
        (45.0 + (RANDOM() * 90))::numeric(5,1) as angle,
        (150.0 + (RANDOM() * 200))::numeric(10,1) as power_generate
    FROM users u
    WHERE u.address_uuid IS NOT NULL
    LIMIT 3
) user_data;

\echo 'Creating events...'

-- Create events for each sensor (simple approach)
INSERT INTO events (uuid, sensor_uuid, power_generated, timestamp, heat)
SELECT 
    gen_random_uuid(),
    s.uuid,
    ROUND((s.power_generate * (0.3 + RANDOM() * 0.7))::numeric, 2) as power_generated,
    NOW() - INTERVAL '1 hour' * (generate_series % 168) as timestamp, -- Last 7 days, hourly
    ROUND((25 + RANDOM() * 20)::numeric, 2) as heat
FROM sensors s
CROSS JOIN generate_series(1, 84) -- 84 events per sensor (every 2 hours for 7 days)
WHERE (generate_series % 2 = 0) -- Only even hours (simulating daylight hours)
AND (generate_series % 168 / 24)::int BETWEEN 0 AND 6; -- 7 days

-- Add some peak performance events
INSERT INTO events (uuid, sensor_uuid, power_generated, timestamp, heat)
SELECT 
    gen_random_uuid(),
    s.uuid,
    ROUND((s.power_generate * 1.1)::numeric, 2),
    NOW() - INTERVAL '1 day' + (RANDOM() * INTERVAL '12 hours'),
    ROUND((35 + RANDOM() * 10)::numeric, 2)
FROM sensors s
WHERE s.code LIKE 'SOLAR-FARM%'
LIMIT 5;

-- Add some low performance events
INSERT INTO events (uuid, sensor_uuid, power_generated, timestamp, heat)
SELECT 
    gen_random_uuid(),
    s.uuid,
    ROUND((s.power_generate * 0.2)::numeric, 2),
    NOW() - INTERVAL '2 days' + (RANDOM() * INTERVAL '6 hours'),
    ROUND((20 + RANDOM() * 5)::numeric, 2)
FROM sensors s
WHERE s.code LIKE 'SOLAR-HOME%'
LIMIT 3;

\echo 'Updating sensor statistics...'

-- Update sensor event counts
UPDATE sensors SET total_events = (
    SELECT COUNT(*)
    FROM events
    WHERE events.sensor_uuid = sensors.uuid
);

\echo 'Simple seeding completed successfully!'

-- Show results
\echo 'Data Summary:'
SELECT 'Users' as entity, COUNT(*) as count FROM users
UNION ALL
SELECT 'Addresses' as entity, COUNT(*) as count FROM addresses
UNION ALL
SELECT 'Sensors' as entity, COUNT(*) as count FROM sensors
UNION ALL
SELECT 'Events' as entity, COUNT(*) as count FROM events;

\echo ''
\echo 'Sensors created:'
SELECT code, power_generate, total_events FROM sensors ORDER BY code;

\echo ''
\echo 'Recent events:'
SELECT 
    s.code,
    e.power_generated,
    e.heat,
    e.timestamp
FROM events e
JOIN sensors s ON e.sensor_uuid = s.uuid
ORDER BY e.timestamp DESC
LIMIT 10;