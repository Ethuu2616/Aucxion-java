#!/bin/bash

echo "========================================"
echo "  AUCXION - Threat Detection System"
echo "========================================"
echo ""
echo "Starting AUCXION..."
echo "Backend will be available at: http://localhost:8080"
echo "Frontend will be available at: http://localhost:3000"
echo ""

# Start backend
echo "Starting backend on port 8080..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!

# Wait for backend to start
counter=0
while [ $counter -lt 30 ]; do
    sleep 2
    if curl -s http://localhost:8080/api/scan/status > /dev/null 2>&1; then
        echo "Backend is ready!"
        break
    fi
    counter=$((counter + 1))
done

if [ $counter -eq 30 ]; then
    echo "Backend took too long to start. Please check the logs."
    exit 1
fi

# Start frontend
echo ""
echo "Starting frontend on port 3000..."
cd ../frontend
npm start &
FRONTEND_PID=$!

# Wait for frontend to start
counter=0
while [ $counter -lt 30 ]; do
    sleep 2
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo ""
        echo "Frontend is ready! Opening dashboard..."
        
        # Open browser based on OS
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            open http://localhost:3000
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            xdg-open http://localhost:3000 2>/dev/null || sensible-browser http://localhost:3000 2>/dev/null
        fi
        break
    fi
    counter=$((counter + 1))
done

if [ $counter -eq 30 ]; then
    echo "Frontend took too long to start. Please check the logs."
    echo "You can manually open: http://localhost:3000"
fi

echo ""
echo "========================================"
echo "  AUCXION is running!"
echo "  Backend:  http://localhost:8080"
echo "  Frontend: http://localhost:3000"
echo "========================================"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
