#!/bin/bash

# This is the entrypoint file for DEVELOPMENT!

# Only build node_modules if they do not exist or if package-lock changed
if [ ! -d node_modules ] || (! sha1sum --check ~/lock); then
  echo "cache is invalid, rebuilding..."

  echo "rebuild dependencies..."
  npm ci

  echo "creating hash for cache validation..."
  sha1sum package-lock.json > ~/lock
else
  echo "cache is valid, continuing..."
fi

# Start the dev server
npm run dev
