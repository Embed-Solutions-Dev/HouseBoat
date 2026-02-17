#!/bin/bash

# HouseBoat Dashboard - Auto-restart Dev Server
# This script runs the dev server with automatic restart on crash

RESTART_DELAY=3
MAX_RESTARTS=10
RESTART_COUNT=0

echo "🚢 HouseBoat Dashboard - Starting dev server with auto-restart..."
echo "📍 URL: https://houseboat-dash.conveyor.echelon.business"
echo "⚙️  Engines: ${VITE_ENGINE_COUNT:-2}"
echo ""

while true; do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting dev server (restart #$RESTART_COUNT)..."

  VITE_ENGINE_COUNT=${VITE_ENGINE_COUNT:-2} npm run dev -- --host 0.0.0.0 --port 3000

  EXIT_CODE=$?

  if [ $EXIT_CODE -eq 0 ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Dev server exited normally"
    break
  fi

  RESTART_COUNT=$((RESTART_COUNT + 1))

  if [ $RESTART_COUNT -ge $MAX_RESTARTS ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] ❌ Max restarts ($MAX_RESTARTS) reached. Exiting."
    exit 1
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️  Dev server crashed (exit code: $EXIT_CODE)"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🔄 Restarting in ${RESTART_DELAY}s..."
  sleep $RESTART_DELAY
done
