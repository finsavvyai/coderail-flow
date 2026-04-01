#!/bin/bash
# Comprehensive Security Audit Script

echo "🔒 CodeRail Flow - Security Audit"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

AUDIT_PASSED=true
AUDIT_WARNINGS=0
AUDIT_ERRORS=0

# Function to check a security item
check_item() {
  local description="$1"
  local command="$2"
  local severity="$3"

  echo -n "Checking $description... "

  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PASS${NC}"
    return 0
  else
    if [ "$severity" = "error" ]; then
      echo -e "${RED}❌ FAIL${NC}"
      AUDIT_ERRORS=$((AUDIT_ERRORS + 1))
      AUDIT_PASSED=false
    else
      echo -e "${YELLOW}⚠️  WARN${NC}"
      AUDIT_WARNINGS=$((AUDIT_WARNINGS + 1))
    fi
    return 1
  fi
}

echo "1. Dependency Vulnerabilities"
echo "-------------------------------"
check_item "for known vulnerabilities" "pnpm audit --audit-level moderate" "warning"
echo ""

echo "2. Security Configuration"
echo "-------------------------"
check_item "if .env files are NOT in git" "! git ls-files | grep -E '\.env$|\.env\\.local'" "error"
check_item "if secrets are not exposed" "! grep -r 'SECRET\\|PASSWORD\\|API_KEY' --include='*.ts' --include='*.tsx' apps/api/src | grep -v 'test\\|spec\\|example'" "error"
echo ""

echo "3. Code Security Scans"
echo "--------------------"
check_item "for console.log in production code" "! grep -r 'console\\.log' apps/api/src/*.ts | grep -v 'test\\|spec' | grep -q 'console\\.log'" "warning"
check_item "for eval usage" "! grep -r 'eval\\|Function\\(\\|setTimeout.*string' apps/api/src/*.ts | grep -q 'eval\\|Function(' "warning"
echo ""

echo "4. TypeScript Safety"
echo "-------------------"
check_item "for strict mode" "grep -q '"strict": true' apps/api/tsconfig.json apps/web/tsconfig.json" "error"
echo ""

echo "5. Test Coverage"
echo "---------------"
check_item "unit tests exist" "[ -f apps/api/src/auth.test.ts ]" "error"
echo ""

echo "6. CI/CD Security"
echo "----------------"
check_item "if security workflow exists" "[ -f .github/workflows/portfolio-security.yml ]" "error"
echo ""

echo "7. Infrastructure Security"
echo "------------------------"
check_item "if auth secrets are configured" "cd apps/api && wrangler secret list 2>&1 | grep -q 'AUTH_SECRET'" "warning"
echo ""

echo "8. CORS Configuration"
echo "----------------------"
check_item "if CORS is configured" "grep -q 'cors' apps/api/src/index.ts" "error"
echo ""

echo "9. Rate Limiting"
echo "---------------"
check_item "if rate limiting is implemented" "grep -q 'rateLimit\\|ratelimit' apps/api/src/index.ts" "error"
echo ""

echo "10. Input Validation"
echo "-------------------"
check_item "if Zod validation is used" "grep -r 'zod' apps/api/src/schemas.ts | grep -q 'import.*zod'" "error"
check_item "if validation middleware exists" "[ -f apps/api/src/middleware/validation.ts ]" "error"
echo ""

echo ""
echo "=================================="
echo "Security Audit Summary"
echo "=================================="
echo ""

if [ "$AUDIT_PASSED" = true ]; then
    echo -e "${GREEN}✅ ALL CRITICAL CHECKS PASSED${NC}"
    echo "Warnings: $AUDIT_WARNINGS"
else
    echo -e "${RED}❌ SECURITY ISSUES FOUND${NC}"
    echo "Errors: $AUDIT_ERRORS"
    echo "Warnings: $AUDIT_WARNINGS"
fi

echo ""
echo "Next Steps:"
echo "1. Review all FAILED items"
echo "2. Address WARNINGS as time permits"
echo "3. Run: npm run security:pentest"
echo "4. Keep dependencies updated"

echo ""
echo "Generated: $(date)"
