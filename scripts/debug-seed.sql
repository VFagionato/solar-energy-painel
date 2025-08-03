-- Debug version of seeding script
\echo 'Starting debug seeding...'

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

\echo 'Check addresses created:'
SELECT COUNT(*) as address_count FROM addresses;

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

\echo 'Check users created:'
SELECT COUNT(*) as user_count FROM users;

\echo 'Check addresses after user linking:'
SELECT COUNT(*) as addresses_with_users FROM addresses WHERE user_uuid IS NOT NULL;
SELECT COUNT(*) as addresses_without_users FROM addresses WHERE user_uuid IS NULL;

\echo 'Creating sensors...'

\echo 'Equipment addresses available for sensors:'
SELECT uuid, street, city FROM addresses WHERE user_uuid IS NULL ORDER BY created_at DESC;

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

\echo 'Check farm sensors created:'
SELECT COUNT(*) as farm_sensors FROM sensors WHERE code LIKE 'SOLAR-FARM%';

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

\echo 'Check all sensors created:'
SELECT code, power_generate FROM sensors ORDER BY code;

\echo 'Creating events...'

-- Create events for each sensor
INSERT INTO events (uuid, sensor_uuid, power_generated, timestamp, heat)
SELECT 
    gen_random_uuid(),
    s.uuid,
    ROUND((s.power_generate * (0.3 + RANDOM() * 0.7))::numeric, 2) as power_generated,
    NOW() - INTERVAL '1 hour' * (generate_series % 168) as timestamp,
    ROUND((25 + RANDOM() * 20)::numeric, 2) as heat
FROM sensors s
CROSS JOIN generate_series(1, 84)
WHERE (generate_series % 2 = 0)
AND (generate_series % 168 / 24)::int BETWEEN 0 AND 6;

\echo 'Check events created:'
SELECT COUNT(*) as event_count FROM events;

-- Update sensor statistics
UPDATE sensors SET total_events = (
    SELECT COUNT(*)
    FROM events
    WHERE events.sensor_uuid = sensors.uuid
);

\echo 'Final summary:'
SELECT 'Users' as entity, COUNT(*) as count FROM users
UNION ALL
SELECT 'Addresses' as entity, COUNT(*) as count FROM addresses
UNION ALL
SELECT 'Sensors' as entity, COUNT(*) as count FROM sensors
UNION ALL
SELECT 'Events' as entity, COUNT(*) as count FROM events;

\echo 'Sensor details:'
SELECT code, power_generate, total_events FROM sensors ORDER BY code;