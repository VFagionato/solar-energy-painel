#!/bin/bash

echo "🌞 Solar Winds Development Environment"
echo ""

# Create .env files if they don't exist
[ ! -f backend/.env ] && [ -f backend/.env.example ] && cp backend/.env.example backend/.env
[ ! -f frontend/.env ] && [ -f frontend/.env.example ] && cp frontend/.env.example frontend/.env

# Try to start PostgreSQL
echo "🗃️  Starting PostgreSQL database..."
if docker-compose up -d postgres > /dev/null 2>&1; then
    echo "✅ PostgreSQL started successfully"
    echo "⏳ Waiting for database to be ready..."
    sleep 5
    
    # Check if database has data
    if ! docker exec solarwinds-postgres psql -U admin -d solarwinds -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1; then
        echo "📊 Database appears to be empty"
        echo ""
        read -p "🌱 Would you like to populate the database with sample data? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo ""
            echo "🌱 Seeding database with solar energy sample data..."
            ./scripts/seed-data.sh
        fi
    else
        # Check if database has meaningful data
        user_count=$(docker exec solarwinds-postgres psql -U admin -d solarwinds -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | tr -d ' ' | head -1)
        if [ "$user_count" -lt 3 ] 2>/dev/null; then
            echo "📊 Database has limited data ($user_count users)"
            read -p "🌱 Would you like to populate with more sample data? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                echo ""
                echo "🌱 Adding sample data to database..."
                ./scripts/seed-data.sh
            fi
        else
            echo "✅ Database has data ($user_count users found)"
        fi
    fi
else
    echo "❌ PostgreSQL not started (Docker may not be available)"
    echo "💡 Make sure Docker is running"
fi

echo ""
echo "🚀 Starting development services..."
echo ""

# Function to cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Install and start backend
echo "🔧 Starting backend server (port 8001)..."
cd backend
[ ! -d node_modules ] && echo "📦 Installing backend dependencies..." && npm install > /dev/null
npm run start:dev &
cd ..

# Install and start frontend  
echo "🌐 Starting frontend server (port 5173)..."
cd frontend
[ ! -d node_modules ] && echo "📦 Installing frontend dependencies..." && npm install > /dev/null
npm run dev &
cd ..

echo ""
echo "🎉 Solar Winds development environment is starting!"
echo ""
echo "📱 Application URLs:"
echo "   🌐 Frontend Dashboard: http://localhost:5173"
echo "   🔧 Backend API: http://localhost:8001"
echo "   🗃️  Database Admin (optional): http://localhost:5050"
echo ""
echo "💡 Tips:"
echo "   - Use Ctrl+C to stop all services"
echo "   - Run './db-manage.sh status' to check database health"
echo "   - Run './scripts/seed-data.sh' to add more sample data"
echo ""
echo "📖 For more commands, see DATABASE_SETUP.md"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait