#!/bin/sh
# GIAI ĐOẠN 7: ENVIRONMENT VARIABLE INJECTION
# Replace environment variables in built React app

set -e

# Default values
BACKEND_URL=${BACKEND_URL:-"https://your-backend.render.com"}
APP_NAME=${APP_NAME:-"IoT Sensor Dashboard"}

echo "🚀 Injecting environment variables..."
echo "BACKEND_URL: $BACKEND_URL"
echo "APP_NAME: $APP_NAME"

# Find all JS files và replace placeholders
find /usr/share/nginx/html -name "*.js" -exec sed -i \
  -e "s|PLACEHOLDER_BACKEND_URL|$BACKEND_URL|g" \
  -e "s|PLACEHOLDER_APP_NAME|$APP_NAME|g" \
  {} \;

# Update nginx config với backend URL
if [ ! -z "$BACKEND_URL" ]; then
  sed -i "s|\${BACKEND_URL}|$BACKEND_URL|g" /etc/nginx/conf.d/default.conf
fi

echo "✅ Environment variables injected successfully"
