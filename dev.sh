#!/bin/bash

# Simple development startup script for Solar Winds
echo "Starting Solar Winds in development mode..."

# Create .env files if they don't exist
[ ! -f backend/.env ] && [ -f backend/.env.example ] && cp backend/.env.example backend/.env
[ ! -f frontend/.env ] && [ -f frontend/.env.example ] && cp frontend/.env.example frontend/.env

# Try to start MongoDB (optional)
echo "Attempting to start MongoDB..."
docker-compose up -d 2>/dev/null && echo "MongoDB started" || echo "MongoDB not started (Docker may not be available)"

# Function to cleanup
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

# Install and start backend
echo "Starting backend..."
cd backend
[ ! -d node_modules ] && npm install
npm run start:dev &
cd ..

# Install and start frontend  
echo "Starting frontend..."
cd frontend
[ ! -d node_modules ] && npm install
npm run dev &
cd ..

echo
echo "Services starting..."
echo "Frontend: http://localhost:5173"  
echo "Backend: http://localhost:8000"
echo
echo "Press Ctrl+C to stop"

# Wait for user to stop
wait