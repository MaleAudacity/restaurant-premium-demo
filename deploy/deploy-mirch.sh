#!/usr/bin/env bash
# Deploy: build production, seed DB if empty, reload PM2.
# Run: bash deploy/deploy-mirch.sh
set -euo pipefail

APP_DIR="/home/anmol/projects/restaurant-premium-demo"
PM2_NAME="restaurant-premium-demo"
export PM2_HOME="/home/anmol/.pm2-restaurant"

cd "$APP_DIR"

echo "[1/7] Installing dependencies"
npm install

echo "[2/7] Generating Prisma client"
npm run db:generate

echo "[3/7] Building production (site stays live during this step)"
npm run build

echo "[4/7] Syncing static assets into standalone"
mkdir -p .next/standalone/.next/static
mkdir -p .next/standalone/.next/server
cp -R .next/static/. .next/standalone/.next/static/
cp -R .next/server/. .next/standalone/.next/server/
cp -R public/. .next/standalone/public/

echo "[5/7] Running DB migrations (prisma db push)"
DATABASE_URL="postgresql://postgres:password@localhost:5432/restaurant_demo" npx prisma db push --skip-generate

echo "[6/7] Reloading PM2"
# Use the live ecosystem config (with real secrets) from PM2_HOME if it exists,
# otherwise fall back to the repo's ecosystem.config.js (which uses placeholder values).
ECOSYSTEM="${PM2_HOME}/ecosystem.config.js"
[ -f "$ECOSYSTEM" ] || ECOSYSTEM="ecosystem.config.js"
if PM2_HOME="$PM2_HOME" npx pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
  PM2_HOME="$PM2_HOME" npx pm2 reload "$ECOSYSTEM" --only "$PM2_NAME" --update-env
else
  PM2_HOME="$PM2_HOME" npx pm2 start "$ECOSYSTEM" --only "$PM2_NAME"
fi

echo "[7/7] Saving PM2 state"
PM2_HOME="$PM2_HOME" npx pm2 save

echo ""
echo "✓ Deploy complete — https://mirch.ai-workflows.cloud"
