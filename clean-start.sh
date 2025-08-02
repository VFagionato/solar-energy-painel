#!/bin/bash

echo "========================================="
echo "Solar Winds - Clean Startup"
echo "========================================="
echo

# Kill all existing Node.js processes (aggressive cleanup)
echo "Cleaning up existing processes..."
pkill -f "node.*nest" 2>/dev/null || true
pkill -f "node.*vite" 2>/dev/null || true
pkill -f "npm.*start" 2>/dev/null || true

# Wait for processes to terminate
sleep 3

# Find available ports
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while netstat -an 2>/dev/null | grep -q ":$port "; do
        port=$((port + 1))
    done
    
    echo $port
}

BACKEND_PORT=$(find_available_port 8000)
echo "Using backend port: $BACKEND_PORT"

# Update backend .env with available port
sed -i "s/PORT=.*/PORT=$BACKEND_PORT/" backend/.env
sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=http://localhost:$BACKEND_PORT|" frontend/.env

echo "Updated configuration files with port $BACKEND_PORT"

# Create .env files if they don't exist
[ ! -f backend/.env ] && [ -f backend/.env.example ] && cp backend/.env.example backend/.env
[ ! -f frontend/.env ] && [ -f frontend/.env.example ] && cp frontend/.env.example frontend/.env

# Try to start PostgreSQL (optional)
echo
echo "Starting PostgreSQL..."
if docker-compose up -d 2>/dev/null; then
    echo "✓ PostgreSQL started successfully"
    sleep 5
else
    echo "⚠ PostgreSQL not started (Docker may not be available)"
fi

# Function to cleanup on script exit
cleanup() {
    echo
    echo "Shutting down services..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        wait $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null  
        wait $FRONTEND_PID 2>/dev/null
    fi
    
    echo "All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo
echo "========================================="
echo "Starting Services..."
echo "========================================="

# Start backend
echo "Starting backend on port $BACKEND_PORT..."
cd backend
[ ! -d node_modules ] && npm install
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd frontend
[ ! -d node_modules ] && npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for services to start
sleep 3

echo
echo "========================================="
echo "🚀 Solar Winds is running!"
echo "========================================="
echo
echo "Frontend: http://localhost:5173 (or next available port)"
echo "Backend:  http://localhost:$BACKEND_PORT"
echo "Health:   http://localhost:$BACKEND_PORT/health"
echo "PostgreSQL: localhost:5432"
echo
echo "Press Ctrl+C to stop all services"
echo

# Keep script running
while true; do
    sleep 10
    echo "Services running... ($(date '+%H:%M:%S'))"
done