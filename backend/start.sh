#!/bin/sh
set -e

echo "Running Nakama migrations..."
/nakama/nakama migrate up --database.address "$DATABASE_URL"

echo "Starting Nakama..."
exec /nakama/nakama --config /nakama/data/local.yml --database.address "$DATABASE_URL"
