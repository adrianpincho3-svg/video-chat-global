#!/bin/bash
set -e

echo "🚀 Starting backend server..."
echo "📁 Current directory: $(pwd)"
echo "📦 Node version: $(node --version)"
echo "📦 NPM version: $(npm --version)"

# Verificar que dist existe
if [ ! -d "dist" ]; then
  echo "❌ Error: dist directory not found"
  echo "📂 Contents of current directory:"
  ls -la
  exit 1
fi

# Verificar que server.js existe
if [ ! -f "dist/server.js" ]; then
  echo "❌ Error: dist/server.js not found"
  echo "📂 Contents of dist directory:"
  ls -la dist
  exit 1
fi

echo "✅ All checks passed, starting server..."
exec node dist/server.js
