#!/bin/bash

set -e

echo "🗄️  Setting up Supabase database..."

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo "❌ Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set"
  exit 1
fi

SUPABASE_PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\(.*\)\.supabase\.co/\1/')

echo "📋 Project ID: $SUPABASE_PROJECT_ID"
echo ""

echo "To apply migrations, you have two options:"
echo ""
echo "Option 1: Using Supabase CLI (Recommended)"
echo "  1. Install Supabase CLI: npm install -g supabase"
echo "  2. Login: supabase login"
echo "  3. Link project: supabase link --project-ref $SUPABASE_PROJECT_ID"
echo "  4. Apply migrations: supabase db push"
echo "  5. Apply seed data: supabase db seed"
echo ""
echo "Option 2: Using SQL Editor in Supabase Dashboard"
echo "  1. Go to: https://supabase.com/dashboard/project/$SUPABASE_PROJECT_ID/sql"
echo "  2. Run each migration file in order (001 -> 007)"
echo "  3. Run seed.sql for sample data"
echo ""
echo "Migration files location: ./supabase/migrations/"
echo ""
echo "✅ Database setup script completed!"
