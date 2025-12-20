#!/bin/bash
# Start backend in WSL with proper Node.js environment

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Navigate to backend directory
cd /mnt/c/NewGenAPPs/newgen-studio/backend || exit 1

# Verify Node.js
echo "🔧 Node version: $(node --version)"
echo "🔧 Starting backend on port 4001..."

# Set environment and start server
PORT=4001 node server.js
