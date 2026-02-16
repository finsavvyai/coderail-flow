---
name: coderail-flow
description: >
  Manage and run browser-automation workflows on CodeRail Flow.
  Use when the user wants to: (1) list, create, or update automation flows,
  (2) trigger a flow run and retrieve results (screenshots, reports, SRT subtitles),
  (3) schedule recurring flow executions via cron,
  (4) generate a flow definition from a natural-language description,
  (5) check run status or download artifacts.
  Requires CODERAIL_API_URL and CODERAIL_API_TOKEN environment variables.
---

# CodeRail Flow

Interact with the [CodeRail Flow](https://coderail-flow.netlify.app) browser-automation API.
Flows are step-based browser workflows that produce screenshots, JSON reports, and SRT subtitles.

## Setup

Two environment variables are required:

| Variable | Example |
|---|---|
| `CODERAIL_API_URL` | `https://coderail-flow-api.broad-dew-49ad.workers.dev` |
| `CODERAIL_API_TOKEN` | Clerk JWT or API key |

All API calls use `Authorization: Bearer $CODERAIL_API_TOKEN`.

## Core Workflows

### 1. List flows

```bash
curl -s -H "Authorization: Bearer $CODERAIL_API_TOKEN" "$CODERAIL_API_URL/flows" | jq .
```

### 2. Trigger a flow run

```bash
curl -s -X POST "$CODERAIL_API_URL/runs" \
  -H "Authorization: Bearer $CODERAIL_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"flowId":"<FLOW_ID>","params":{}}' | jq .
```

Returns `{"runId":"..."}`. Poll for completion:

```bash
curl -s -H "Authorization: Bearer $CODERAIL_API_TOKEN" \
  "$CODERAIL_API_URL/runs/<RUN_ID>" | jq '.run.status'
```

Status transitions: `queued` → `running` → `succeeded` | `failed`.

### 3. Download artifacts

After a run succeeds, its artifacts (screenshots, reports, SRT) are listed in the run response under `artifacts[]`. Download:

```bash
curl -s -H "Authorization: Bearer $CODERAIL_API_TOKEN" \
  "$CODERAIL_API_URL/artifacts/<ARTIFACT_ID>/download" -o artifact.png
```

Preview inline (e.g. for screenshots):

```bash
curl -s -H "Authorization: Bearer $CODERAIL_API_TOKEN" \
  "$CODERAIL_API_URL/artifacts/<ARTIFACT_ID>/preview" -o preview.png
```

### 4. Create a flow from natural language

When the user describes a workflow in plain English, convert it to the CodeRail Flow definition format. See `references/flow-schema.md` for the full step schema.

```bash
curl -s -X POST "$CODERAIL_API_URL/flows" \
  -H "Authorization: Bearer $CODERAIL_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "<PROJECT_ID>",
    "name": "User-described flow",
    "description": "Auto-generated from natural language",
    "definition": { "params": [], "steps": [...] }
  }' | jq .
```

### 5. Retry a failed run

```bash
curl -s -X POST "$CODERAIL_API_URL/runs/<RUN_ID>/retry" \
  -H "Authorization: Bearer $CODERAIL_API_TOKEN" | jq .
```

### 6. Schedule recurring runs (cron)

Use OpenClaw's cron to schedule flow runs. Example — daily at 9 AM:

```
Schedule: 0 9 * * *
Action: Run the "compliance-check" flow on CodeRail Flow and send me the report.
```

The script `scripts/run_and_poll.sh` handles trigger + polling + artifact download in one shot.

## API Reference

For the full API endpoints and flow definition schema, read `references/api-reference.md` and `references/flow-schema.md`.
