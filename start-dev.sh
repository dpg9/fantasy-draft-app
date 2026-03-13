#!/bin/bash
echo "Starting Fantasy Draft App..."

# Start Server
echo "Starting Backend on port 5001..."
cd server
if [ ! -d "node_modules" ]; then
    npm install
fi
node server.js &
SERVER_PID=$!

# Start Client
echo "Starting Frontend..."
cd ../client
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
CLIENT_PID=$!

# Handle exit
trap "kill $SERVER_PID $CLIENT_PID; exit" INT TERM EXIT

wait
