#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================"
echo "Solar Winds Application Stop Script"
echo -e "========================================${NC}"
echo

echo "Stopping Docker containers..."
docker-compose down

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Docker containers stopped successfully${NC}"
else
    echo -e "${RED}Error: Failed to stop Docker containers${NC}"
fi

# Kill any remaining Node.js processes on our ports
echo
echo "Checking for remaining processes..."

# Find and kill processes on port 3000 (backend)
BACKEND_PID=$(lsof -ti:3000)
if [ ! -z "$BACKEND_PID" ]; then
    echo "Stopping backend process (PID: $BACKEND_PID)..."
    kill -TERM $BACKEND_PID 2>/dev/null
    sleep 2
    # Force kill if still running
    if kill -0 $BACKEND_PID 2>/dev/null; then
        kill -KILL $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Backend process stopped${NC}"
    fi
else
    echo -e "${GREEN}✓ No backend process found on port 3000${NC}"
fi

# Find and kill processes on port 5173 (frontend)
FRONTEND_PID=$(lsof -ti:5173)
if [ ! -z "$FRONTEND_PID" ]; then
    echo "Stopping frontend process (PID: $FRONTEND_PID)..."
    kill -TERM $FRONTEND_PID 2>/dev/null
    sleep 2
    # Force kill if still running
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        kill -KILL $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✓ Frontend process stopped${NC}"
    fi
else
    echo -e "${GREEN}✓ No frontend process found on port 5173${NC}"
fi

# Clean up log files
if [ -f "backend.log" ]; then
    rm backend.log
    echo -e "${GREEN}✓ Backend log file cleaned up${NC}"
fi

if [ -f "frontend.log" ]; then
    rm frontend.log
    echo -e "${GREEN}✓ Frontend log file cleaned up${NC}"
fi

echo
echo -e "${GREEN}All services stopped successfully!${NC}"