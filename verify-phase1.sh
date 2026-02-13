#!/bin/bash

# Phase 1 Verification Script
# Run this to verify all Phase 1 components are properly set up

echo "🔍 CodeRail Flow - Phase 1 Verification"
echo "========================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# 1. Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    echo -e "${GREEN}✓${NC} Node.js version OK ($(node -v))"
else
    echo -e "${RED}✗${NC} Node.js version too old. Need v20+, got $(node -v)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 2. Check pnpm
echo "📦 Checking pnpm..."
if command -v pnpm &> /dev/null; then
    echo -e "${GREEN}✓${NC} pnpm installed ($(pnpm -v))"
else
    echo -e "${RED}✗${NC} pnpm not found. Install with: npm i -g pnpm"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 3. Check workspace structure
echo "📁 Checking workspace structure..."
REQUIRED_DIRS=(
    "apps/api"
    "apps/web"
    "packages/dsl"
    "packages/overlay"
    "packages/runner"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir exists"
    else
        echo -e "${RED}✗${NC} $dir missing"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# 4. Check overlay build
echo "🎨 Checking overlay build..."
if [ -f "packages/overlay/dist/index.js" ]; then
    echo -e "${GREEN}✓${NC} Overlay built successfully"
else
    echo -e "${YELLOW}⚠${NC} Overlay not built. Run: cd packages/overlay && pnpm run build"
fi
echo ""

# 5. Check runner implementation
echo "🤖 Checking runner implementation..."
RUNNER_FILES=(
    "packages/runner/src/executor.ts"
    "packages/runner/src/locator.ts"
    "packages/runner/src/subtitle.ts"
    "packages/runner/src/r2.ts"
    "packages/runner/src/index.ts"
)

for file in "${RUNNER_FILES[@]}"; do
    if [ -f "$file" ]; then
        LINES=$(wc -l < "$file")
        echo -e "${GREEN}✓${NC} $file ($LINES lines)"
    else
        echo -e "${RED}✗${NC} $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# 6. Check API integration
echo "🔌 Checking API integration..."
if [ -f "apps/api/src/runner.ts" ]; then
    echo -e "${GREEN}✓${NC} Real runner integrated (apps/api/src/runner.ts)"
else
    echo -e "${RED}✗${NC} Runner integration missing"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "runFlow" apps/api/src/index.ts; then
    echo -e "${GREEN}✓${NC} API uses real runner (not stub)"
else
    echo -e "${YELLOW}⚠${NC} API may still be using stub runner"
fi
echo ""

# 7. Check wrangler.toml browser binding
echo "🌐 Checking Browser Rendering binding..."
if grep -q "[[browser]]" apps/api/wrangler.toml; then
    echo -e "${GREEN}✓${NC} Browser binding configured in wrangler.toml"
else
    echo -e "${RED}✗${NC} Browser binding missing from wrangler.toml"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 8. Check dependencies
echo "📚 Checking dependencies..."
if [ -f "pnpm-workspace.yaml" ]; then
    echo -e "${GREEN}✓${NC} Workspace configuration exists"
else
    echo -e "${RED}✗${NC} pnpm-workspace.yaml missing"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "@cloudflare/puppeteer" packages/runner/package.json; then
    echo -e "${GREEN}✓${NC} Puppeteer dependency added"
else
    echo -e "${RED}✗${NC} Puppeteer dependency missing"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# 9. Check documentation
echo "📖 Checking documentation..."
DOCS=(
    "PHASE1_COMPLETE.md"
    "QUICKSTART.md"
)

for doc in "${DOCS[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc exists"
    else
        echo -e "${YELLOW}⚠${NC} $doc missing"
    fi
done
echo ""

# 10. Check migrations
echo "🗄️  Checking database migrations..."
MIGRATIONS=$(ls apps/api/migrations/*.sql 2>/dev/null | wc -l)
echo -e "${GREEN}✓${NC} Found $MIGRATIONS migration files"

if ls apps/api/migrations/*demo_flow.sql 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Demo flow migration exists"
else
    echo -e "${YELLOW}⚠${NC} Demo flow migration not found"
fi
echo ""

# Summary
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Phase 1 verification PASSED!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: cd apps/api && pnpm run dev"
    echo "2. Run: cd apps/web && pnpm run dev"
    echo "3. Open: http://localhost:5173"
    echo "4. Test the demo flow!"
else
    echo -e "${RED}❌ Phase 1 verification found $ERRORS error(s)${NC}"
    echo ""
    echo "Please fix the errors above and run this script again."
fi
echo ""
