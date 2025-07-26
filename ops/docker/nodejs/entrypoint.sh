#!/bin/bash
set -e
cd /app

echo "Starting dev-server..."
exec npm run dev -- --host 0.0.0.0