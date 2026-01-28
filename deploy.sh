#!/bin/bash

echo "🚀 Deploying Vivento Campus Events Platform..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "🏗️  Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Deploy backend to Render.com using the GitHub repository"
    echo "2. Deploy frontend to Netlify by dragging the 'build' folder"
    echo "3. Set environment variables as described in DEPLOYMENT.md"
    echo ""
    echo "📁 Build folder ready for deployment: ./build"
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Frontend build failed!"
    exit 1
fi