# Step Types

CodeRailFlow supports 14 step types. Each step in a flow has a `type` field and type-specific parameters.

## goto

Navigate to a URL.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | yes | The URL to navigate to |
| `waitUntil` | string | no | Load event: `load`, `domcontentloaded`, `networkidle` |

```json
{ "type": "goto", "url": "https://example.com", "waitUntil": "networkidle" }
```

## caption

Add a visual overlay caption and an SRT subtitle entry.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Caption text to display |
| `position` | string | no | `top`, `center`, `bottom` (default `bottom`) |
| `durationMs` | number | no | How long to display (default 3000) |

```json
{ "type": "caption", "text": "Filling in the login form", "position": "top" }
```

## click

Click an element on the page.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | yes | CSS or XPath selector |
| `button` | string | no | `left`, `right`, `middle` (default `left`) |

```json
{ "type": "click", "selector": "#submit-btn" }
```

## fill

Type text into an input field.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | yes | Target input selector |
| `value` | string | yes | Text to type |
| `clear` | boolean | no | Clear field first (default `true`) |

```json
{ "type": "fill", "selector": "input[name=email]", "value": "user@example.com" }
```

## highlight

Draw a visual overlay around an element.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | yes | Element to highlight |
| `color` | string | no | Border color (default `#ff0000`) |
| `label` | string | no | Optional text label |

```json
{ "type": "highlight", "selector": ".price", "color": "#00ff00", "label": "Price" }
```

## waitFor

Wait for an element to appear or a condition to be met.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | no | Wait for this selector to appear |
| `timeoutMs` | number | no | Max wait time (default 30000) |
| `state` | string | no | `visible`, `attached`, `hidden` (default `visible`) |

```json
{ "type": "waitFor", "selector": ".results-loaded", "timeoutMs": 10000 }
```

## pause

Pause execution for a fixed duration.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `durationMs` | number | yes | Milliseconds to wait |

```json
{ "type": "pause", "durationMs": 2000 }
```

## selectRow

Select a row in a table or list by index or content.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | yes | Table or list container selector |
| `index` | number | no | Zero-based row index |
| `text` | string | no | Match row containing this text |

```json
{ "type": "selectRow", "selector": "table.data", "text": "Order #1234" }
```

## assertText

Assert that specific text appears on the page.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Expected text content |
| `selector` | string | no | Scope assertion to this element |

```json
{ "type": "assertText", "text": "Welcome back", "selector": ".greeting" }
```

## screenshot

Capture a screenshot of the current page state.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `fullPage` | boolean | no | Capture full scrollable page (default `false`) |
| `selector` | string | no | Capture only this element |
| `name` | string | no | Custom artifact filename |

```json
{ "type": "screenshot", "fullPage": true, "name": "homepage-full" }
```

## scroll

Scroll the page or an element.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `direction` | string | yes | `up`, `down`, `left`, `right` |
| `amount` | number | no | Pixels to scroll (default 500) |
| `selector` | string | no | Scroll within this element |

```json
{ "type": "scroll", "direction": "down", "amount": 800 }
```

## hover

Hover over an element.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | yes | Element to hover over |

```json
{ "type": "hover", "selector": ".dropdown-trigger" }
```

## select

Choose an option from a `<select>` dropdown.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `selector` | string | yes | The select element |
| `value` | string | yes | Option value to select |

```json
{ "type": "select", "selector": "#country", "value": "US" }
```

## setCookies

Set cookies before or during a flow.

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `cookies` | array | yes | Array of cookie objects |

Each cookie object: `{ name, value, domain, path?, secure?, httpOnly? }`

```json
{
  "type": "setCookies",
  "cookies": [
    { "name": "session", "value": "abc123", "domain": "example.com" }
  ]
}
```
