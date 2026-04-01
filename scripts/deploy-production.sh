#!/bin/bash
set -euo pipefail

API_DIR="apps/api"
WEB_DIR="apps/web"
PAGES_PROJECT_NAME="coderail-flow"
WEB_URL="https://flow.coderail.dev"
API_URL_DEFAULT="https://api.coderail.dev"

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
SECRET_LIST=$(wrangler secret list --cwd "$API_DIR" 2>/dev/null || true)

if ! printf '%s\n' "$SECRET_LIST" | grep -q "AUTH_SECRET"; then
    echo -e "${YELLOW}⚠️  AUTH_SECRET not set${NC}"
    SECRETS_OK=false
fi

if ! printf '%s\n' "$SECRET_LIST" | grep -q "AUTH_ENCRYPTION_KEY"; then
    echo -e "${YELLOW}⚠️  AUTH_ENCRYPTION_KEY not set${NC}"
    SECRETS_OK=false
fi

if ! printf '%s\n' "$SECRET_LIST" | grep -Eq "GOOGLE_CLIENT_SECRET|GITHUB_CLIENT_SECRET|LINKEDIN_CLIENT_SECRET|AZURE_AD_CLIENT_SECRET"; then
    echo -e "${YELLOW}⚠️  No Auth.js OAuth provider client secret is set${NC}"
    SECRETS_OK=false
fi

if [ "$SECRETS_OK" = false ]; then
    echo ""
    echo "Some secrets are not configured. Set them with:"
    echo "  wrangler secret put AUTH_SECRET --cwd $API_DIR"
    echo "  wrangler secret put AUTH_ENCRYPTION_KEY --cwd $API_DIR"
    echo "  wrangler secret put GOOGLE_CLIENT_SECRET --cwd $API_DIR"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 1
    fi
elif ! printf '%s\n' "$SECRET_LIST" | grep -Eq "GOOGLE_CLIENT_ID|GITHUB_CLIENT_ID|LINKEDIN_CLIENT_ID|AZURE_AD_CLIENT_ID"; then
    echo -e "${YELLOW}⚠️  No Auth.js OAuth provider client ID is configured in Cloudflare vars/secrets${NC}"
fi

if ! printf '%s\n' "$SECRET_LIST" | grep -q "SENTRY_DSN"; then
    echo -e "${YELLOW}⚠️  SENTRY_DSN not set; production errors will not be reported to Sentry${NC}"
fi

echo ""
echo "📦 Deploying API to production..."
cd "$API_DIR"
if ! API_DEPLOY_OUTPUT=$(wrangler deploy --env="" 2>&1); then
    echo "$API_DEPLOY_OUTPUT"
    echo -e "${RED}❌ API deployment failed${NC}"
    exit 1
fi
echo "$API_DEPLOY_OUTPUT"
API_URL=$(printf '%s\n' "$API_DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+\.workers\.dev' | tail -n 1)
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

if ! WEB_DEPLOY_OUTPUT=$(wrangler pages deploy dist --project-name="$PAGES_PROJECT_NAME" --commit-dirty=true 2>&1); then
    echo "$WEB_DEPLOY_OUTPUT"
    echo -e "${RED}❌ Web deployment failed${NC}"
    exit 1
fi
echo "$WEB_DEPLOY_OUTPUT"
WEB_DEPLOYMENT_URL=$(printf '%s\n' "$WEB_DEPLOY_OUTPUT" | grep -Eo 'https://[^[:space:]]+\.pages\.dev' | head -n 1)
echo -e "${GREEN}✅ Web deployed${NC}"
cd ../..

echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"
echo ""
echo "📍 Production URLs:"
echo "  API: $API_URL_DEFAULT"
if [ -n "${API_URL:-}" ]; then
    echo "  Worker hostname: $API_URL"
fi
echo "  Web: $WEB_URL"
if [ -n "${WEB_DEPLOYMENT_URL:-}" ]; then
    echo "  Latest Pages deployment: $WEB_DEPLOYMENT_URL"
fi
echo ""
echo "🧪 To run E2E tests against production:"
echo "  E2E_BASE_URL=$WEB_URL E2E_API_URL=$API_URL_DEFAULT npm run test:e2e"
echo ""
echo "📊 To view logs:"
if [ -n "${API_URL:-}" ]; then
    echo "  wrangler tail --env=\"\" --cwd $API_DIR"
else
    echo "  wrangler tail --env=\"\" --cwd $API_DIR"
fi
echo ""
