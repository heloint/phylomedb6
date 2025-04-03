#!/bin/sh
set -e

node ./_scripts/wait-for-development-db.mjs

if [ "$NODE_ENV" = "development" ]; then
  echo "==> Starting in development mode..."
  npm run dev
else
  echo "==> Starting in production mode..."
  npm run build && npm start
fi
