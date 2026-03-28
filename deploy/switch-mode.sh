#!/bin/bash
# Output .env content for dev or prod.
# chmod +x deploy/switch-mode.sh
# Usage: ./deploy/switch-mode.sh prod > server/.env   or   ./deploy/switch-mode.sh dev

MODE="${1:-dev}"
SERVER_IP="35.228.147.76"

if [ "$MODE" = "prod" ]; then
  cat << 'ENV_PROD'
# Production (server 35.228.147.76)
PORT=5000
NODE_ENV=production
CLIENT_URL=http://35.228.147.76

# MongoDB — замените на свои данные (локальный или Atlas)
MONGODB_URI=mongodb://localhost:27017/inkar

# JWT — обязательно смените в проде!
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d

AUTO_CONFIRM_BOOKINGS=true
ENV_PROD
elif [ "$MODE" = "dev" ]; then
  cat << 'ENV_DEV'
# Development (local)
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/inkar
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long
JWT_EXPIRE=7d

AUTO_CONFIRM_BOOKINGS=true
ENV_DEV
else
  echo "Usage: $0 dev|prod" >&2
  exit 1
fi
