#!/bin/bash
set -euo pipefail

echo "🧪 CodeRail Flow - E2E Tests (Production)"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default production URLs
API_URL="${E2E_API_URL:-https://coderail-flow-api.broad-dew-49ad.workers.dev}"
WEB_URL="${E2E_BASE_URL:-https://coderail-flow.pages.dev}"

echo "📍 Target URLs:"
echo "  API: $API_URL"
echo "  Web: $WEB_URL"
echo ""

# Check if Playwright is installed
if ! npx playwright --version &> /dev/null; then
    echo "📦 Installing Playwright browsers..."
    npx playwright install --with-deps
fi

# Health check first
echo "🔍 Checking API readiness..."
READY_RESPONSE=$(curl -s "$API_URL/health/ready")
if echo "$READY_RESPONSE" | grep -q '"ok":true'; then
    echo -e "${GREEN}✅ API is ready${NC}"
else
    echo -e "${RED}❌ API readiness check failed${NC}"
    echo "Response: $READY_RESPONSE"
    exit 1
fi

echo ""
echo "🧪 Running E2E tests..."
echo ""

# Run tests
E2E_BASE_URL="$WEB_URL" E2E_API_URL="$API_URL" npx playwright test \
    --reporter=list \
    --reporter=html \
    --reporter=json \
    --output=e2e-results

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}✅ All E2E tests passed!${NC}"
    echo ""
    echo "📊 View detailed report:"
    echo "  npm run test:e2e:report"
else
    echo -e "${RED}❌ Some E2E tests failed${NC}"
    echo ""
    echo "📊 View detailed report:"
    echo "  npm run test:e2e:report"
    echo ""
    echo "📸 View screenshots:"
    echo "  ls -la e2e-results/"
fi

exit $TEST_EXIT_CODE
