const { DataSource } = require('typeorm');
const path = require('path');

// Database configuration
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'admin',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'solarwinds',
  entities: [path.join(__dirname, '../src/entities/*.entity{.ts,.js}')],
  synchronize: false,
  logging: false,
});

// Sample data
const sampleAddresses = [
  // User addresses
  { street: 'Rua das Flores', number: '123', city: 'São Paulo', state: 'SP', zipcode: '01234-567', country: 'Brasil', type: 'user' },
  { street: 'Avenida Paulista', number: '1000', city: 'São Paulo', state: 'SP', zipcode: '01310-100', country: 'Brasil', type: 'user' },
  { street: 'Rua Oscar Freire', number: '456', city: 'São Paulo', state: 'SP', zipcode: '01426-001', country: 'Brasil', type: 'user' },
  { street: 'Avenida Faria Lima', number: '2500', city: 'São Paulo', state: 'SP', zipcode: '01452-000', country: 'Brasil', type: 'user' },
  { street: 'Rua Augusta', number: '789', city: 'São Paulo', state: 'SP', zipcode: '01305-000', country: 'Brasil', type: 'user' },
  
  // Equipment addresses (solar farms)
  { street: 'Estrada Rural Solar', number: 'KM 15', city: 'Ribeirão Preto', state: 'SP', zipcode: '14000-000', country: 'Brasil', type: 'equipment' },
  { street: 'Fazenda Energia Limpa', number: 'S/N', city: 'Campinas', state: 'SP', zipcode: '13000-000', country: 'Brasil', type: 'equipment' },
  { street: 'Parque Solar Central', number: 'Lote 10', city: 'Sorocaba', state: 'SP', zipcode: '18000-000', country: 'Brasil', type: 'equipment' },
  { street: 'Campo Solar Norte', number: 'Área A', city: 'Santos', state: 'SP', zipcode: '11000-000', country: 'Brasil', type: 'equipment' },
  { street: 'Usina Solar Sul', number: 'Setor 5', city: 'São José dos Campos', state: 'SP', zipcode: '12000-000', country: 'Brasil', type: 'equipment' },
];

const sampleUsers = [
  { name: 'João', last_name: 'Silva', document: '123.456.789-01' },
  { name: 'Maria', last_name: 'Santos', document: '234.567.890-12' },
  { name: 'Pedro', last_name: 'Oliveira', document: '345.678.901-23' },
  { name: 'Ana', last_name: 'Costa', document: '456.789.012-34' },
  { name: 'Carlos', last_name: 'Ferreira', document: '567.890.123-45' },
];

const sampleSensors = [
  { code: 'SOLAR-FARM-001', angle: 180.0, power_generate: 850.5, type: 'farm' },
  { code: 'SOLAR-FARM-002', angle: 165.0, power_generate: 920.0, type: 'farm' },
  { code: 'SOLAR-FARM-003', angle: 200.0, power_generate: 780.3, type: 'farm' },
  { code: 'SOLAR-FARM-004', angle: 175.0, power_generate: 1100.2, type: 'farm' },
  { code: 'SOLAR-FARM-005', angle: 190.0, power_generate: 650.8, type: 'farm' },
  { code: 'SOLAR-HOME-001', angle: 45.0, power_generate: 250.5, type: 'home' },
  { code: 'SOLAR-HOME-002', angle: 60.0, power_generate: 320.8, type: 'home' },
  { code: 'SOLAR-HOME-003', angle: 30.0, power_generate: 180.2, type: 'home' },
  { code: 'SOLAR-PANEL-A1', angle: 120.0, power_generate: 450.6, type: 'commercial' },
  { code: 'SOLAR-PANEL-B2', angle: 135.0, power_generate: 520.9, type: 'commercial' },
];

// Helper functions
function getRandomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getSolarIntensity(hour) {
  if (hour < 6 || hour > 18) return 0;
  return Math.max(0, Math.sin(Math.PI * (hour - 6) / 12));
}

function getWeatherFactor() {
  const random = Math.random();
  if (random > 0.95) return getRandomFloat(0.1, 0.3); // Very cloudy/rainy
  if (random > 0.8) return getRandomFloat(0.3, 0.7); // Cloudy
  return getRandomFloat(0.8, 1.0); // Clear day
}

async function seedDatabase() {
  console.log('🌞 Starting Solar Winds database seeding...');
  
  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await queryRunner.query('DELETE FROM events');
    await queryRunner.query('DELETE FROM sensors');
    await queryRunner.query('DELETE FROM users');
    await queryRunner.query('DELETE FROM addresses');

    // Create addresses with proper structure for PostgreSQL
    console.log('🏠 Creating sample addresses...');
    const addresses = [];
    
    for (const addrData of sampleAddresses) {
      const result = await queryRunner.query(`
        INSERT INTO addresses (street, number, city, state, zipcode, country, user_uuid, sensor_uuid)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        addrData.street,
        addrData.number,
        addrData.city,
        addrData.state,
        addrData.zipcode,
        addrData.country,
        null, // user_uuid will be set later
        null  // sensor_uuid will be set later
      ]);
      addresses.push({ ...result[0], type: addrData.type });
    }

    // Create users and link to addresses
    console.log('👥 Creating sample users...');
    const users = [];
    const userAddresses = addresses.filter(addr => addr.type === 'user');
    
    for (let i = 0; i < sampleUsers.length; i++) {
      const userData = sampleUsers[i];
      const userAddress = userAddresses[i];
      
      const result = await queryRunner.query(`
        INSERT INTO users (name, last_name, document, address_uuid)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `, [userData.name, userData.last_name, userData.document, userAddress.uuid]);
      
      const savedUser = result[0];
      users.push(savedUser);

      // Update address to reference user
      await queryRunner.query(`
        UPDATE addresses SET user_uuid = $1 WHERE uuid = $2
      `, [savedUser.uuid, userAddress.uuid]);
    }

    // Create sensors
    console.log('🔌 Creating sample sensors...');
    const sensors = [];
    const equipmentAddresses = addresses.filter(addr => addr.type === 'equipment');
    
    for (let i = 0; i < sampleSensors.length; i++) {
      const sensorData = sampleSensors[i];
      const equipAddress = equipmentAddresses[i % equipmentAddresses.length];
      
      // Assign some home sensors to users
      let userUuid = null;
      if (sensorData.type === 'home' && users.length > 0) {
        userUuid = users[i % Math.min(3, users.length)].uuid;
      }
      
      const result = await queryRunner.query(`
        INSERT INTO sensors (code, equip_address_uuid, angle, power_generate, total_events, total_shutdown, user_uuid, last_shutdown)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        sensorData.code,
        equipAddress.uuid,
        sensorData.angle,
        sensorData.power_generate,
        0,
        getRandomInt(0, 3),
        userUuid,
        Math.random() > 0.7 ? new Date(Date.now() - getRandomInt(1, 7) * 24 * 60 * 60 * 1000) : null
      ]);
      
      const savedSensor = result[0];
      sensors.push(savedSensor);
      
      // Update equipment address to reference sensor
      await queryRunner.query(`
        UPDATE addresses SET sensor_uuid = $1 WHERE uuid = $2
      `, [savedSensor.uuid, equipAddress.uuid]);
    }

    // Generate realistic events for the last 30 days
    console.log('⚡ Generating realistic energy events...');
    const events = [];
    
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const endDate = new Date();
    
    for (const sensor of sensors) {
      console.log(`   📊 Generating events for sensor ${sensor.code}...`);
      
      // Generate events every 2 hours during daylight for the last 30 days
      for (let date = new Date(startDate); date <= endDate; date.setHours(date.getHours() + 2)) {
        const hour = date.getHours();
        const solarIntensity = getSolarIntensity(hour);
        
        if (solarIntensity > 0.1) { // Only generate events during meaningful solar activity
          const weatherFactor = getWeatherFactor();
          const powerGenerated = parseFloat((sensor.power_generate * solarIntensity * weatherFactor).toFixed(2));
          
          if (powerGenerated > 0) {
            events.push({
              sensor_uuid: sensor.uuid,
              power_generated: powerGenerated,
              timestamp: new Date(date),
              heat: parseFloat((25 + (sensor.power_generate * solarIntensity * 0.05) + getRandomFloat(-5, 5)).toFixed(2)),
            });
          }
        }
      }
    }

    // Save events in batches
    console.log(`💾 Saving ${events.length} events...`);
    const batchSize = 100;
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      
      // Insert batch using raw SQL for better performance
      for (const event of batch) {
        await queryRunner.query(`
          INSERT INTO events (sensor_uuid, power_generated, timestamp, heat)
          VALUES ($1, $2, $3, $4)
        `, [event.sensor_uuid, event.power_generated, event.timestamp, event.heat]);
      }
      
      if (i % 500 === 0) {
        console.log(`   Saved ${Math.min(i + batchSize, events.length)}/${events.length} events...`);
      }
    }

    // Update sensor statistics
    console.log('📈 Updating sensor statistics...');
    for (const sensor of sensors) {
      const result = await queryRunner.query(`
        SELECT COUNT(*) as count FROM events WHERE sensor_uuid = $1
      `, [sensor.uuid]);
      
      const eventCount = parseInt(result[0].count);
      await queryRunner.query(`
        UPDATE sensors SET total_events = $1 WHERE uuid = $2
      `, [eventCount, sensor.uuid]);
    }

    // Add some special events
    console.log('✨ Adding special performance events...');
    const farmSensors = sensors.filter(s => s.code.includes('FARM')).slice(0, 2);
    for (const sensor of farmSensors) {
      // Peak performance event
      await queryRunner.query(`
        INSERT INTO events (sensor_uuid, power_generated, timestamp, heat)
        VALUES ($1, $2, $3, $4)
      `, [
        sensor.uuid,
        getRandomFloat(800, 1200),
        new Date(Date.now() - getRandomInt(1, 3) * 24 * 60 * 60 * 1000),
        getRandomFloat(35, 50)
      ]);
    }

    const homeSensors = sensors.filter(s => s.code.includes('HOME')).slice(0, 2);
    for (const sensor of homeSensors) {
      // Low performance event (maintenance/cloudy)
      await queryRunner.query(`
        INSERT INTO events (sensor_uuid, power_generated, timestamp, heat)
        VALUES ($1, $2, $3, $4)
      `, [
        sensor.uuid,
        getRandomFloat(10, 60),
        new Date(Date.now() - getRandomInt(1, 5) * 24 * 60 * 60 * 1000),
        getRandomFloat(20, 30)
      ]);
    }

    await queryRunner.release();

    // Show summary
    console.log('\n📊 Database seeding completed successfully!');
    console.log('\n📈 Data Summary:');
    
    const userCount = await queryRunner.query('SELECT COUNT(*) as count FROM users');
    const addressCount = await queryRunner.query('SELECT COUNT(*) as count FROM addresses');
    const sensorCount = await queryRunner.query('SELECT COUNT(*) as count FROM sensors');
    const eventCount = await queryRunner.query('SELECT COUNT(*) as count FROM events');
    
    console.log(`   👥 Users: ${userCount[0]?.count || 0}`);
    console.log(`   🏠 Addresses: ${addressCount[0]?.count || 0}`);
    console.log(`   🔌 Sensors: ${sensorCount[0]?.count || 0}`);
    console.log(`   ⚡ Events: ${eventCount[0]?.count || 0}`);

    console.log('\n🔌 Sample sensors created:');
    const sampleSensorList = await queryRunner.query(`
      SELECT code, power_generate, total_events 
      FROM sensors 
      ORDER BY code ASC 
      LIMIT 5
    `);
    sampleSensorList.forEach(s => {
      console.log(`   ${s.code}: ${s.power_generate}kW (${s.total_events} events)`);
    });

    console.log('\n⚡ Recent events sample:');
    const recentEvents = await queryRunner.query(`
      SELECT e.power_generated, e.timestamp, s.code 
      FROM events e 
      JOIN sensors s ON e.sensor_uuid = s.uuid 
      ORDER BY e.timestamp DESC 
      LIMIT 5
    `);
    recentEvents.forEach(e => {
      console.log(`   ${e.code}: ${e.power_generated}kW at ${e.timestamp.toISOString()}`);
    });

    console.log('\n🎉 Your solar energy dashboard is ready with realistic data!');
    console.log('🌐 Frontend: http://localhost:5173');
    console.log('🔧 Backend: http://localhost:8001');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };