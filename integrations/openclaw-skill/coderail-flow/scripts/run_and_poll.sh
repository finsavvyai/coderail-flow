#!/usr/bin/env bash
# run_and_poll.sh — Trigger a CodeRail Flow run, poll until complete, download artifacts.
#
# Usage:
#   ./run_and_poll.sh <FLOW_ID> [PARAMS_JSON]
#
# Environment:
#   CODERAIL_API_URL   — API base URL (required)
#   CODERAIL_API_TOKEN — Bearer token (required)
#   POLL_INTERVAL      — Seconds between polls (default: 5)
#   MAX_POLLS          — Max poll attempts (default: 60)
#   OUTPUT_DIR         — Directory to save artifacts (default: ./artifacts)

set -euo pipefail

FLOW_ID="${1:?Usage: run_and_poll.sh <FLOW_ID> [PARAMS_JSON]}"
PARAMS="${2:-{}}"
API="${CODERAIL_API_URL:?Set CODERAIL_API_URL}"
TOKEN="${CODERAIL_API_TOKEN:?Set CODERAIL_API_TOKEN}"
INTERVAL="${POLL_INTERVAL:-5}"
MAX="${MAX_POLLS:-60}"
OUTDIR="${OUTPUT_DIR:-./artifacts}"

AUTH="Authorization: Bearer $TOKEN"

# 1. Trigger run
echo "Triggering flow $FLOW_ID..."
RUN_RESPONSE=$(curl -sf -X POST "$API/runs" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d "{\"flowId\":\"$FLOW_ID\",\"params\":$PARAMS}")

RUN_ID=$(echo "$RUN_RESPONSE" | jq -r '.runId')
if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
  echo "ERROR: Failed to create run. Response: $RUN_RESPONSE" >&2
  exit 1
fi
echo "Run created: $RUN_ID"

# 2. Poll until complete
echo "Polling for completion (every ${INTERVAL}s, max ${MAX} attempts)..."
for i in $(seq 1 "$MAX"); do
  POLL=$(curl -sf -H "$AUTH" "$API/runs/$RUN_ID")
  STATUS=$(echo "$POLL" | jq -r '.run.status')

  case "$STATUS" in
    succeeded)
      echo "Run succeeded!"
      break
      ;;
    failed)
      ERROR=$(echo "$POLL" | jq -r '.run.error_message // "unknown error"')
      echo "Run failed: $ERROR" >&2
      exit 2
      ;;
    queued|running)
      printf "  [%d/%d] status=%s\r" "$i" "$MAX" "$STATUS"
      sleep "$INTERVAL"
      ;;
    *)
      echo "Unexpected status: $STATUS" >&2
      exit 3
      ;;
  esac

  if [ "$i" -eq "$MAX" ]; then
    echo "Timed out after $MAX polls" >&2
    exit 4
  fi
done

# 3. Download artifacts
mkdir -p "$OUTDIR"
ARTIFACTS=$(echo "$POLL" | jq -c '.artifacts[]')

if [ -z "$ARTIFACTS" ]; then
  echo "No artifacts produced."
  exit 0
fi

echo "Downloading artifacts to $OUTDIR..."
echo "$ARTIFACTS" | while IFS= read -r art; do
  ART_ID=$(echo "$art" | jq -r '.id')
  KIND=$(echo "$art" | jq -r '.kind')
  CT=$(echo "$art" | jq -r '.content_type')

  case "$KIND" in
    report)     EXT="json" ;;
    subtitle)   EXT="srt"  ;;
    screenshot*) EXT="png"  ;;
    *)          EXT="bin"  ;;
  esac

  FILENAME="$OUTDIR/${KIND}-${ART_ID}.${EXT}"
  curl -sf -H "$AUTH" "$API/artifacts/$ART_ID/download" -o "$FILENAME"
  echo "  Downloaded: $FILENAME ($CT)"
done

echo "Done. Artifacts saved to $OUTDIR"
