#!/bin/bash
set -euo pipefail

API_DIR="apps/api"
WEB_DIR="apps/web"
PAGES_PROJECT_NAME="coderail-flow"

echo "🚀 CodeRail Flow - Production Deployment"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found${NC}"
    echo "Installing wrangler..."
    pnpm add -g wrangler
fi

# Check if user is logged in
echo "🔍 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare${NC}"
    echo "Please login:"
    wrangler login
fi

echo -e "${GREEN}✅ Authenticated${NC}"
echo ""

# Run release validation first
echo "🧪 Running production validation..."
pnpm run validate:production
echo -e "${GREEN}✅ Validation passed${NC}"
echo ""

# Check if secrets are configured
echo "🔐 Checking required secrets..."
SECRETS_OK=true

# Check for required secrets (you can add more)
if ! wrangler secret list --cwd "$API_DIR" 2>/dev/null | grep -q "CLERK_ISSUER"; then
    echo -e "${YELLOW}⚠️  CLERK_ISSUER not set${NC}"
    SECRETS_OK=false
fi

if ! wrangler secret list --cwd "$API_DIR" 2>/dev/null | grep -q "AUTH_ENCRYPTION_KEY"; then
    echo -e "${YELLOW}⚠️  AUTH_ENCRYPTION_KEY not set${NC}"
    SECRETS_OK=false
fi

if [ "$SECRETS_OK" = false ]; then
    echo ""
    echo "Some secrets are not configured. Set them with:"
    echo "  wrangler secret put CLERK_ISSUER --cwd $API_DIR"
    echo "  wrangler secret put AUTH_ENCRYPTION_KEY --cwd $API_DIR"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

echo ""
echo "📦 Deploying API to production..."
cd "$API_DIR"
wrangler deploy
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ API deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ API deployed${NC}"
cd ../..

echo ""
echo "🌐 Building and deploying Web to production..."
cd "$WEB_DIR"
pnpm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web build failed${NC}"
    exit 1
fi

wrangler pages deploy dist --project-name="$PAGES_PROJECT_NAME"
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Web deployment failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Web deployed${NC}"
cd ../..

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📍 Production URLs:"
echo "  API: https://coderail-flow-api.YOUR_SUBDOMAIN.workers.dev"
echo "  Web: https://coderail-flow.pages.dev"
echo ""
echo "🧪 To run E2E tests against production:"
echo "  E2E_BASE_URL=https://coderail-flow.pages.dev npm run test:e2e"
echo ""
echo "📊 To view logs:"
echo "  wrangler tail"
echo ""
