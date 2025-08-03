#!/bin/bash

echo "🌞 Solar Winds Database Seeding Script"
echo ""

# Check if PostgreSQL container is running
if ! docker ps | grep -q solarwinds-postgres; then
    echo "❌ PostgreSQL container is not running"
    echo "Starting PostgreSQL..."
    docker-compose up -d postgres
    echo "⏳ Waiting for database to be ready..."
    sleep 10
fi

echo "🔄 Checking database connection..."
if ! docker exec solarwinds-postgres pg_isready -U admin -d solarwinds > /dev/null; then
    echo "❌ Database is not ready. Please check PostgreSQL status."
    exit 1
fi

echo "✅ Database is ready!"
echo ""

echo "🗑️  Warning: This will DELETE all existing data!"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Seeding cancelled"
    exit 0
fi

echo ""
echo "🌱 Seeding database with sample solar energy data..."
echo "This may take a few minutes..."

# Run the seeding SQL script
docker exec -i solarwinds-postgres psql -U admin -d solarwinds < scripts/seed-database.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database seeded successfully!"
    echo ""
    echo "📊 Your solar energy monitoring system now has:"
    echo "   👥 5 Sample users with real addresses"
    echo "   🏠 10 Different locations (homes and solar farms)"
    echo "   🔌 10 Solar sensors with realistic configurations"
    echo "   ⚡ 1000+ Energy generation events over 30 days"
    echo ""
    echo "🎉 Ready to explore the dashboard!"
    echo "🌐 Frontend: http://localhost:5173"
    echo "🔧 Backend: http://localhost:8001"
    echo ""
else
    echo ""
    echo "❌ Error occurred during seeding"
    echo "Check the error messages above"
fi