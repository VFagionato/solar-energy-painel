#!/bin/bash

echo "========================================"
echo "Solar Winds Application Startup Script"
echo "========================================"
echo

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists node; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "Error: npm is not installed"
    echo "Please install npm"
    exit 1
fi

echo "✓ Node.js and npm are installed"

# Check if Docker is available (but don't require it to be running yet)
if ! command_exists docker; then
    echo "Warning: Docker is not installed"
    echo "Please install Docker from https://www.docker.com/"
    echo "For now, continuing without MongoDB..."
    SKIP_DOCKER=true
else
    echo "✓ Docker is installed"
    SKIP_DOCKER=false
fi

# Check environment files
echo
echo "Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        echo "Creating backend/.env from example..."
        cp "backend/.env.example" "backend/.env"
    else
        echo "Warning: backend/.env.example not found"
    fi
fi

if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/.env.example" ]; then
        echo "Creating frontend/.env from example..."
        cp "frontend/.env.example" "frontend/.env"
    else
        echo "Warning: frontend/.env.example not found"
    fi
fi

echo "✓ Environment files ready"

# Start MongoDB if Docker is available
if [ "$SKIP_DOCKER" = false ]; then
    echo
    echo "Starting MongoDB database..."
    
    # Try to start Docker containers
    if docker-compose up -d 2>/dev/null; then
        echo "✓ MongoDB started successfully"
        sleep 3  # Wait for MongoDB to be ready
    else
        echo "Warning: Could not start MongoDB with Docker"
        echo "You may need to start Docker Desktop or install Docker Compose"
        echo "Continuing without database..."
    fi
fi

# Install dependencies
echo
echo "Installing dependencies..."

# Backend dependencies
if [ ! -d "backend/node_modules" ] || [ ! -f "backend/node_modules/.installed" ]; then
    echo "Installing backend dependencies..."
    cd backend
    if npm install; then
        touch node_modules/.installed
        echo "✓ Backend dependencies installed"
    else
        echo "Error: Failed to install backend dependencies"
        cd ..
        exit 1
    fi
    cd ..
else
    echo "✓ Backend dependencies already installed"
fi

# Frontend dependencies
if [ ! -d "frontend/node_modules" ] || [ ! -f "frontend/node_modules/.installed" ]; then
    echo "Installing frontend dependencies..."
    cd frontend
    if npm install; then
        touch node_modules/.installed
        echo "✓ Frontend dependencies installed"
    else
        echo "Error: Failed to install frontend dependencies"
        cd ..
        exit 1
    fi
    cd ..
else
    echo "✓ Frontend dependencies already installed"
fi

# Function to cleanup on script exit
cleanup() {
    echo
    echo "Shutting down services..."
    
    # Kill background processes
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

# Set up signal handlers
trap cleanup SIGINT SIGTERM

echo
echo "========================================"
echo "Starting Solar Winds Application..."
echo "========================================"
echo

# Start backend
echo "Starting backend server..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 5

# Start frontend
echo "Starting frontend server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for services to start
sleep 3

echo
echo "========================================"
echo "Application is running!"
echo "========================================"
echo
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:3000"
echo "Health:   http://localhost:3000/health"
echo
echo "Press Ctrl+C to stop all services"
echo

# Keep script running and show status
while true; do
    sleep 10
    echo "Services running... ($(date '+%H:%M:%S'))"
done