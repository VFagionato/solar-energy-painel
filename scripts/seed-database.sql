-- Solar Winds Database Seeding Script
-- This script populates the database with realistic sample data for development

\echo 'Starting Solar Winds database seeding...'

-- Clear existing data (be careful in production!)
DELETE FROM events;
DELETE FROM sensors;
DELETE FROM users;
DELETE FROM addresses;

-- Reset sequences if needed
-- Note: Since we use UUIDs, no sequence reset needed

\echo 'Creating sample addresses...'

-- Insert sample addresses for different locations
INSERT INTO addresses (uuid, user_uuid, sensor_uuid, street, number, city, state, zipcode, country) VALUES
-- User addresses
(gen_random_uuid(), NULL, NULL, 'Rua das Flores', '123', 'São Paulo', 'SP', '01234-567', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Avenida Paulista', '1000', 'São Paulo', 'SP', '01310-100', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Rua Oscar Freire', '456', 'São Paulo', 'SP', '01426-001', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Avenida Faria Lima', '2500', 'São Paulo', 'SP', '01452-000', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Rua Augusta', '789', 'São Paulo', 'SP', '01305-000', 'Brasil'),

-- Sensor equipment addresses (solar farms)
(gen_random_uuid(), NULL, NULL, 'Estrada Rural Solar', 'KM 15', 'Ribeirão Preto', 'SP', '14000-000', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Fazenda Energia Limpa', 'S/N', 'Campinas', 'SP', '13000-000', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Parque Solar Central', 'Lote 10', 'Sorocaba', 'SP', '18000-000', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Campo Solar Norte', 'Área A', 'Santos', 'SP', '11000-000', 'Brasil'),
(gen_random_uuid(), NULL, NULL, 'Usina Solar Sul', 'Setor 5', 'São José dos Campos', 'SP', '12000-000', 'Brasil');

\echo 'Creating sample users...'

-- Get some address UUIDs for users
WITH user_addresses AS (
    SELECT uuid, ROW_NUMBER() OVER (ORDER BY created_at) as rn 
    FROM addresses 
    WHERE sensor_uuid IS NULL 
    LIMIT 5
)
INSERT INTO users (uuid, name, last_name, document, address_uuid) 
SELECT 
    gen_random_uuid(),
    names.name,
    names.last_name,
    names.document,
    user_addresses.uuid
FROM (
    VALUES 
        ('João', 'Silva', '123.456.789-01'),
        ('Maria', 'Santos', '234.567.890-12'),
        ('Pedro', 'Oliveira', '345.678.901-23'),
        ('Ana', 'Costa', '456.789.012-34'),
        ('Carlos', 'Ferreira', '567.890.123-45')
) AS names(name, last_name, document)
JOIN user_addresses ON user_addresses.rn = (
    CASE names.name 
        WHEN 'João' THEN 1
        WHEN 'Maria' THEN 2
        WHEN 'Pedro' THEN 3
        WHEN 'Ana' THEN 4
        WHEN 'Carlos' THEN 5
    END
);

\echo 'Updating addresses with user references...'

-- Update addresses to reference users
UPDATE addresses SET user_uuid = (
    SELECT u.uuid FROM users u WHERE u.address_uuid = addresses.uuid
) WHERE uuid IN (
    SELECT address_uuid FROM users WHERE address_uuid IS NOT NULL
);

\echo 'Creating sample sensors...'

-- First, create sensors for equipment addresses (solar farms)
WITH equipment_addresses AS (
    SELECT uuid, street, city, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn 
    FROM addresses 
    WHERE user_uuid IS NULL 
    LIMIT 5
)
INSERT INTO sensors (uuid, code, equip_address_uuid, total_events, angle, power_generate, last_shutdown, total_shutdown, user_uuid)
SELECT 
    gen_random_uuid(),
    'SOLAR-FARM-' || LPAD(equipment_addresses.rn::text, 3, '0'),
    equipment_addresses.uuid,
    0, -- Will be updated after events are created
    ROUND((RANDOM() * 180 + 90)::numeric, 1), -- Random angle between 90-270
    ROUND((RANDOM() * 500 + 500)::numeric, 1), -- Random power between 500-1000kW
    CASE WHEN RANDOM() > 0.7 THEN NOW() - INTERVAL '2 days' ELSE NULL END,
    FLOOR(RANDOM() * 3)::integer, -- 0-2 shutdowns
    NULL -- No user for farm sensors
FROM equipment_addresses;

-- Then create home sensors linked to users
WITH user_addresses AS (
    SELECT u.uuid as user_uuid, u.address_uuid, ROW_NUMBER() OVER (ORDER BY u.created_at) as rn
    FROM users u 
    WHERE u.address_uuid IS NOT NULL
    LIMIT 3
)
INSERT INTO sensors (uuid, code, equip_address_uuid, total_events, angle, power_generate, last_shutdown, total_shutdown, user_uuid)
SELECT 
    gen_random_uuid(),
    'SOLAR-HOME-' || LPAD(user_addresses.rn::text, 3, '0'),
    user_addresses.address_uuid,
    0, -- Will be updated after events are created
    ROUND((RANDOM() * 90 + 45)::numeric, 1), -- Random angle between 45-135 for home
    ROUND((RANDOM() * 200 + 100)::numeric, 1), -- Random power between 100-300kW for home
    CASE WHEN RANDOM() > 0.8 THEN NOW() - INTERVAL '1 day' ELSE NULL END,
    FLOOR(RANDOM() * 2)::integer, -- 0-1 shutdowns for home
    user_addresses.user_uuid
FROM user_addresses;

\echo 'Generating realistic energy events...'

-- Generate events for each sensor over the last 7 days (simpler approach)
DO $$
DECLARE
    sensor_record RECORD;
    event_time TIMESTAMP;
    power_val NUMERIC;
    heat_val NUMERIC;
    hour_val INTEGER;
    day_offset INTEGER;
BEGIN
    -- Loop through each sensor
    FOR sensor_record IN SELECT uuid, code, power_generate FROM sensors LOOP
        \echo 'Generating events for sensor: ' || sensor_record.code;
        
        -- Generate events for last 7 days, every 2 hours during daylight (6 AM to 6 PM)
        FOR day_offset IN 0..6 LOOP
            FOR hour_val IN 6..18 BY 2 LOOP
                event_time := NOW() - INTERVAL '1 day' * day_offset + INTERVAL '1 hour' * hour_val;
                
                -- Calculate realistic power based on time of day
                power_val := sensor_record.power_generate * 
                           (SIN(PI() * (hour_val - 6) / 12)) * 
                           (0.6 + RANDOM() * 0.4); -- 60-100% efficiency
                
                -- Calculate heat (25-45 degrees base + power factor)
                heat_val := 25 + (power_val * 0.02) + (RANDOM() * 20);
                
                -- Only insert if power is meaningful
                IF power_val > 10 THEN
                    INSERT INTO events (uuid, sensor_uuid, power_generated, timestamp, heat)
                    VALUES (
                        gen_random_uuid(),
                        sensor_record.uuid,
                        ROUND(power_val, 2),
                        event_time,
                        ROUND(heat_val, 2)
                    );
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

\echo 'Updating sensor statistics...'

-- Update sensor total_events based on actual events created
UPDATE sensors SET total_events = (
    SELECT COUNT(*) 
    FROM events 
    WHERE events.sensor_uuid = sensors.uuid
);

\echo 'Adding some special high/low performance events...'

-- Add a few special events
INSERT INTO events (uuid, sensor_uuid, power_generated, timestamp, heat)
SELECT 
    gen_random_uuid(),
    s.uuid,
    ROUND((s.power_generate * 1.2)::numeric, 2), -- 120% performance
    NOW() - INTERVAL '1 day' + (RANDOM() * INTERVAL '12 hours'),
    ROUND((40 + RANDOM() * 10)::numeric, 2)
FROM sensors s
WHERE s.code LIKE 'SOLAR-FARM%'
LIMIT 3;

-- Add some low performance events
INSERT INTO events (uuid, sensor_uuid, power_generated, timestamp, heat)
SELECT 
    gen_random_uuid(),
    s.uuid,
    ROUND((s.power_generate * 0.3)::numeric, 2), -- 30% performance (cloudy/maintenance)
    NOW() - INTERVAL '2 days' + (RANDOM() * INTERVAL '6 hours'),
    ROUND((20 + RANDOM() * 10)::numeric, 2)
FROM sensors s
WHERE s.code LIKE 'SOLAR-HOME%'
LIMIT 2;

\echo 'Database seeding completed successfully!'

-- Show summary of created data
\echo 'Data Summary:'
SELECT 'Users' as entity, COUNT(*) as count FROM users
UNION ALL
SELECT 'Addresses' as entity, COUNT(*) as count FROM addresses
UNION ALL
SELECT 'Sensors' as entity, COUNT(*) as count FROM sensors
UNION ALL
SELECT 'Events' as entity, COUNT(*) as count FROM events;

\echo ''
\echo 'Sample sensor codes created:'
SELECT code, power_generate, total_events FROM sensors ORDER BY code;

\echo ''
\echo 'Recent events sample:'
SELECT 
    s.code,
    e.power_generated,
    e.heat,
    e.timestamp
FROM events e
JOIN sensors s ON e.sensor_uuid = s.uuid
ORDER BY e.timestamp DESC
LIMIT 10;