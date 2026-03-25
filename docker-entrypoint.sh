#!/bin/sh
set -e

echo "Applying Prisma migrations..."
npx prisma migrate deploy --schema prisma/schema.prisma

echo "Starting Next.js..."
exec node server.js
