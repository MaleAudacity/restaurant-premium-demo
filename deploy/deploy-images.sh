#!/usr/bin/env bash
# Fast image sync — copies public/images/ to standalone output without rebuilding.
# Use this whenever you add/change image files. Takes ~1 second.
set -euo pipefail

APP_DIR="/home/anmol/projects/restaurant-premium-demo"
STANDALONE="$APP_DIR/.next/standalone/public"

if [ ! -d "$STANDALONE" ]; then
  echo "ERROR: .next/standalone/public not found. Run full deploy first."
  exit 1
fi

echo "Syncing images..."
rsync -a --delete "$APP_DIR/public/images/" "$STANDALONE/images/"
echo "Done. Images live immediately — no restart needed."
