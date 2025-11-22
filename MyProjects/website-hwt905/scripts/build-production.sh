#!/bin/bash
# GIAI ĐOẠN 7: PRODUCTION BUILD SCRIPT

set -e
echo "🚀 Starting production build process..."

# Configuration
PROJECT_NAME="IoT Sensor Dashboard"
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
VERSION=$(node -p "require('./package.json').version")

echo "Project: ${PROJECT_NAME}"
echo "Version: ${VERSION}"
echo "Build Date: ${BUILD_DATE}"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf build/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --silent

# Set build environment variables
echo "⚙️ Setting build environment..."
export REACT_APP_NAME="${PROJECT_NAME}"
export REACT_APP_VERSION="${VERSION}"
export REACT_APP_BUILD_DATE="${BUILD_DATE}"
export GENERATE_SOURCEMAP=false
export REACT_APP_ENV=production

# Build the application
echo "🏗️ Building React application..."
npm run build

# Validate build
echo "✅ Validating build..."
if [ ! -f "build/index.html" ]; then
  echo "❌ Build failed: index.html not found"
  exit 1
fi

BUILD_SIZE=$(du -sh build/ | cut -f1)
echo "📊 Build size: ${BUILD_SIZE}"

echo "✅ Production build completed successfully!"
echo "📁 Build output: ./build/"
exit 0