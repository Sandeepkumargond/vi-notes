#!/bin/bash

# Vi-Notes Setup Script
# This script sets up the complete development environment

set -e

echo "🚀 Vi-Notes Setup Script"
echo "========================"

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Install root dependencies
echo ""
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo ""
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Create .env files if they don't exist
echo ""
echo "📝 Creating environment configuration files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env"
fi

# Check for Docker
echo ""
if command -v docker &> /dev/null; then
    echo "✅ Docker is installed: $(docker --version)"
    echo ""
    echo "🐳 Starting MongoDB with Docker Compose..."
    docker-compose up -d mongodb
    echo "✅ MongoDB is running (connection: mongodb://admin:password@localhost:27017)"
else
    echo "⚠️  Docker is not installed. Skipping MongoDB setup."
    echo "   Install Docker or set up MongoDB manually at mongodb://localhost:27017"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎯 Next steps:"
echo ""
echo "   Terminal 1 - Start Backend:"
echo "   $ cd backend && npm run dev"
echo ""
echo "   Terminal 2 - Start Frontend:"
echo "   $ cd frontend && npm run dev"
echo ""
echo "   Then visit: http://localhost:3000"
echo ""
