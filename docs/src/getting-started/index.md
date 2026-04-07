# Getting Started

Set up your first CodeRailFlow automation in five minutes.

## 1. Sign Up

Create an account at [flow.coderail.dev](https://flow.coderail.dev). You get a free tier with 50 runs per month.

## 2. Create a Project

From the dashboard, click **New Project**. Give it a name and optional description. Each project holds related flows and their artifacts.

## 3. Get Your API Key

Go to **Settings > API Keys** and generate a token. You will use this as a `Bearer` token in all API requests.

## 4. Define a Flow

A flow is an ordered list of steps. Each step has a `type` and parameters. Here is a minimal example:

```json
{
  "name": "Check Homepage",
  "steps": [
    { "type": "goto", "url": "https://example.com" },
    { "type": "caption", "text": "Landing on the homepage" },
    { "type": "screenshot" },
    { "type": "click", "selector": "a.cta-button" },
    { "type": "waitFor", "selector": ".dashboard" },
    { "type": "screenshot" }
  ]
}
```

CodeRailFlow supports **14 step types**: `goto`, `caption`, `click`, `fill`, `highlight`, `waitFor`, `pause`, `selectRow`, `assertText`, `screenshot`, `scroll`, `hover`, `select`, and `setCookies`. See the [Step Types](/steps/) reference for full details.

## 5. Create the Flow via API

```bash
curl -X POST https://api.coderail.dev/flows \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d @flow.json
```

## 6. Run It

Trigger a run:

```bash
curl -X POST https://api.coderail.dev/runs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "flowId": "FLOW_ID" }'
```

## 7. View Results

When the run completes you get:

- **Screenshots** at each `screenshot` step
- **SRT subtitle file** from all `caption` steps
- **Run log** with timing and status for every step

Fetch artifacts:

```bash
curl https://api.coderail.dev/artifacts?runId=RUN_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Next Steps

- Browse all [Step Types](/steps/) to build richer flows
- Read the [API Reference](/api/) for the full endpoint list
- Set up scheduled runs with cron expressions
