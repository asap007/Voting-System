#!/bin/bash

# VoteHub AI - Backend Setup Script
# This script helps set up the backend infrastructure on Cloudflare

set -e

echo "🚀 VoteHub AI - Backend Setup"
echo "=============================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Installing..."
    npm install -g wrangler
fi

# Login to Cloudflare
echo "📝 Logging in to Cloudflare..."
npx wrangler login

# Create D1 Database
echo ""
echo "📊 Creating D1 database..."
echo "Please save the database_id from the output below:"
npx wrangler d1 create votehub-db
echo ""
read -p "Enter the database_id from above: " DB_ID

# Create KV Namespace
echo ""
echo "🗄️ Creating KV namespace..."
echo "Please save the id from the output below:"
npx wrangler kv:namespace create KV
echo ""
read -p "Enter the KV namespace id from above: " KV_ID

# Update wrangler.toml
echo ""
echo "📝 Updating wrangler.toml..."
sed -i.bak "s/database_id = \".*\"/database_id = \"$DB_ID\"/" wrangler.toml
sed -i.bak "s/id = \"YOUR_KV_ID\"/id = \"$KV_ID\"/" wrangler.toml
rm wrangler.toml.bak

# Apply database schema
echo ""
echo "🏗️ Applying database schema..."
npx wrangler d1 execute votehub-db --file=./schema.sql

# Generate encryption key
echo ""
echo "🔐 Generating encryption key..."
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo "Generated encryption key: $ENCRYPTION_KEY"

# Set up .dev.vars for local development
echo ""
echo "📝 Setting up .dev.vars for local development..."
read -p "Enter your Gemini API key: " GEMINI_KEY

cat > .dev.vars << EOF
GEMINI_API_KEY="$GEMINI_KEY"
ENCRYPTION_KEY="$ENCRYPTION_KEY"
EOF

echo ""
echo "✅ .dev.vars file created!"

# Ask about production secrets
echo ""
read -p "Do you want to set production secrets now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Setting GEMINI_API_KEY..."
    echo "$GEMINI_KEY" | npx wrangler secret put GEMINI_API_KEY
    
    echo "Setting ENCRYPTION_KEY..."
    echo "$ENCRYPTION_KEY" | npx wrangler secret put ENCRYPTION_KEY
    
    echo "✅ Production secrets set!"
fi

echo ""
echo "🎉 Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to test locally"
echo "2. Run 'npm run deploy' to deploy to Cloudflare"
echo ""
echo "Your database ID: $DB_ID"
echo "Your KV namespace ID: $KV_ID"
echo ""
echo "⚠️  Keep these IDs safe - you'll need them if you recreate wrangler.toml"
