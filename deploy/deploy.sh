#!/bin/bash
# Deploy Inkar to server (run on the server or via SSH)
# chmod +x deploy/deploy.sh  &&  ./deploy/deploy.sh [--local]
# --local = run from your machine, deploy via SSH to 35.228.147.76

set -e
SERVER_IP="35.228.147.76"
SERVER_USER="${DEPLOY_USER:-ubuntu}"
REMOTE_PROJECT_DIR="${DEPLOY_PROJECT_DIR:-/home/$SERVER_USER/inkar}"
WWW_DIR="/var/www/inkar"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_DIR="$REPO_ROOT"

run_remote() {
  ssh "$SERVER_USER@$SERVER_IP" "$@"
}

deploy_on_server() {
  echo "==> Deploying on server..."
  cd "$PROJECT_DIR" || exit 1

  echo "==> Pulling latest code..."
  git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true

  echo "==> Installing dependencies (client)..."
  cd client && npm ci && cd ..

  echo "==> Building client (production)..."
  cd client
  export VITE_API_URL="/api"
  npm run build
  cd ..

  echo "==> Copying client build to $WWW_DIR..."
  sudo mkdir -p "$WWW_DIR"
  sudo rsync -av --delete client/dist/ "$WWW_DIR/"

  echo "==> Installing dependencies (server)..."
  cd server && npm ci --omit=dev && cd ..

  echo "==> Switching to production env..."
  cd "$REPO_ROOT" && ./deploy/switch-mode.sh prod > server/.env
  cd "$PROJECT_DIR" || exit 1

  echo "==> Restarting backend..."
  if command -v pm2 &>/dev/null; then
    pm2 restart inkar-server --update-env 2>/dev/null || pm2 start server/index.js --name inkar-server
  else
    (pkill -f "node.*server/index.js" 2>/dev/null; sleep 1; cd server && nohup node index.js > /tmp/inkar-server.log 2>&1 &)
  fi

  echo "==> Reloading nginx..."
  sudo nginx -t && sudo systemctl reload nginx

  echo "==> Deploy finished. App: http://$SERVER_IP"
}

if [ "$1" = "--local" ]; then
  echo "==> Deploying from local machine to $SERVER_IP..."
  run_remote "cd $REMOTE_PROJECT_DIR && git pull && bash deploy/deploy.sh"
  exit 0
fi

# If we're in the repo and have client/server dirs, we're on the server
if [ -d "$REPO_ROOT/client" ] && [ -d "$REPO_ROOT/server" ]; then
  deploy_on_server
else
  echo "Run this script on the server (from project root) or use: ./deploy.sh --local"
  exit 1
fi
