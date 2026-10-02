#!/usr/bin/env bash
# Usage: ./scripts/healthcheck.sh http://localhost:3000
URL="${1:-http://localhost:3000}"
for i in 1 2 3 4 5; do
  if curl -fsS "$URL/health" | grep -q '"UP"'; then
    echo "✅ Application is healthy"; exit 0
  fi
  echo "Attempt $i failed, retrying in 5s..."; sleep 5
done
echo "❌ Application is NOT healthy"; exit 1
