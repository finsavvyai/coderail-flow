# CodeRail Flow Definition Schema

A flow definition is a JSON object with `params` and `steps`.

## Structure

```json
{
  "params": [
    { "name": "email", "type": "string", "required": true },
    { "name": "retries", "type": "number", "required": false }
  ],
  "steps": [
    { "type": "navigate", "url": "https://example.com/login" },
    { "type": "fill", "elementId": "<ELEMENT_ID>", "value": "{{email}}" },
    { "type": "click", "elementId": "<ELEMENT_ID>" },
    { "type": "screenshot", "label": "after-login" },
    { "type": "wait", "ms": 2000 },
    { "type": "assert", "elementId": "<ELEMENT_ID>", "condition": "visible" }
  ]
}
```

## Param types

`string`, `number`, `boolean`, `json`

Params are interpolated into step values via `{{paramName}}`.

## Step types

| Type | Required fields | Description |
|------|----------------|-------------|
| `navigate` | `url` | Navigate browser to URL |
| `click` | `elementId` | Click an element |
| `fill` | `elementId`, `value` | Type text into an input |
| `screenshot` | `label` | Capture a screenshot artifact |
| `wait` | `ms` | Wait for N milliseconds |
| `assert` | `elementId`, `condition` | Assert element state |
| `select` | `elementId`, `value` | Select dropdown option |
| `scroll` | `direction`, `amount` | Scroll the page |

## Element locators

Elements are stored separately and referenced by `elementId`. Each element has:

- `locatorPrimary`: `{ "type": "testid|role|label|css|xpath", "value": "..." }`
- `locatorFallbacks`: array of fallback locators
- `reliabilityScore`: 0.0–1.0 (testid=1.0, role=0.8, label=0.7, css=0.4, xpath=0.2)

## Artifacts produced

After a run completes, artifacts are available:

- **screenshot** — PNG image captured at each `screenshot` step
- **report** — JSON summary of the run (timings, step results, errors)
- **subtitle** — SRT file with narrated step descriptions and timestamps

## Example: Login flow

```json
{
  "params": [
    { "name": "email", "type": "string", "required": true },
    { "name": "password", "type": "string", "required": true }
  ],
  "steps": [
    { "type": "navigate", "url": "https://app.example.com/login" },
    { "type": "fill", "elementId": "elm_email_input", "value": "{{email}}" },
    { "type": "fill", "elementId": "elm_password_input", "value": "{{password}}" },
    { "type": "screenshot", "label": "credentials-filled" },
    { "type": "click", "elementId": "elm_submit_btn" },
    { "type": "wait", "ms": 3000 },
    { "type": "assert", "elementId": "elm_dashboard_heading", "condition": "visible" },
    { "type": "screenshot", "label": "dashboard-loaded" }
  ]
}
```
