#!/bin/bash
# Sentry setup verification script

echo "🔍 Sentry Configuration Verification"
echo "======================================"
echo ""

# Check if SENTRY_DSN is configured
echo "1. Checking SENTRY_DSN secret..."
if wrangler secret list --cwd apps/api | grep -q "SENTRY_DSN"; then
    echo "   ✅ SENTRY_DSN is configured"
else
    echo "   ❌ SENTRY_DSN not found"
    echo ""
    echo "   To configure:"
    echo "   wrangler secret put SENTRY_DSN"
    echo "   # Enter your Sentry DSN"
fi

echo ""
echo "2. Checking other Sentry secrets..."
for secret in SENTRY_ENVIRONMENT SENTRY_RELEASE; do
    if wrangler secret list --cwd apps/api | grep -q "$secret"; then
        echo "   ✅ $secret is configured"
    else
        echo "   ⚠️  $secret not configured (optional)"
    fi
done

echo ""
echo "3. Testing Sentry integration..."
echo "   The application will automatically send errors to Sentry once configured."
echo "   Check: https://sentry.io for incoming events"

echo ""
echo "4. Next steps:"
echo "   a) Configure SENTRY_DSN if not done"
echo "   b) Deploy: wrangler deploy"
echo "   c) Trigger a test error to verify"
echo "   d) Check Sentry dashboard for events"
