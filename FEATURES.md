# CodeRail Flow - Feature Documentation

Complete documentation for all features in CodeRail Flow.

## Table of Contents

1. [Dashboard](#dashboard)
2. [Flow Builder](#flow-builder)
3. [Element Mapper](#element-mapper)
4. [Project Manager](#project-manager)
5. [Cookie Manager](#cookie-manager)
6. [Step Types Reference](#step-types-reference)
7. [API Reference](#api-reference)

---

## Dashboard

The main dashboard (`/app`) provides:

- **Flow List**: View all available flows with descriptions
- **Run History**: See all flow executions with status
- **Live Progress**: Real-time step-by-step execution updates
- **Screenshot Gallery**: View captured screenshots from runs
- **Artifact Downloads**: Download reports, subtitles, and screenshots
- **Error Display**: Detailed error information with retry option

### Running a Flow

1. Select a flow from the dropdown
2. Click "Run flow"
3. Watch live progress as steps execute
4. View screenshots and artifacts when complete

---

## Flow Builder

Visual flow creation interface (`/projects` → New Flow).

### Creating a Flow

1. Navigate to Projects page
2. Select a project
3. Click "New Flow"
4. Enter flow name and description
5. Add steps using the step palette
6. Configure each step's parameters
7. Save the flow

### Step Palette

Click any step type to add it to your flow:

| Icon | Step | Description |
|------|------|-------------|
| 🌐 | Navigate | Go to a URL or screen |
| 💬 | Caption | Show text overlay |
| 👆 | Click | Click an element |
| ✏️ | Fill | Type into an input |
| ✨ | Highlight | Highlight an element |
| ⏳ | Wait For | Wait for element state |
| ⏸️ | Pause | Wait for duration |
| 📋 | Select Row | Select table row by text |
| ✅ | Assert Text | Verify text exists |
| 📸 | Screenshot | Take labeled screenshot |
| 📜 | Scroll | Scroll page or element |
| 🎯 | Hover | Hover over element |
| 📝 | Select Option | Select dropdown option |
| 🍪 | Set Cookies | Set authentication cookies |

### Step Reordering

- Use ↑/↓ buttons to move steps
- Click a step to edit its configuration
- Click trash icon to delete a step

### Parameters

Use `{{paramName}}` syntax in step values to reference flow parameters:

```json
{
  "type": "fill",
  "elementId": "el-search",
  "value": "{{searchQuery}}"
}
```

---

## Element Mapper

Visual element picker for creating element locators (`/projects` → Map Elements).

### Mapping Elements

1. Enter the target page URL
2. Click "Start Inspecting"
3. Click any element on the page
4. Review generated locators
5. Name the element
6. Select or create a screen
7. Save the element

### Locator Strategies

The mapper generates multiple locator strategies in priority order:

1. **data-testid** (highest priority) - Most reliable
2. **ARIA role + label** - Accessibility-based
3. **CSS selector** - ID or class-based
4. **XPath** (fallback) - DOM path-based

### Fallback Chain

If the primary locator fails, the runner automatically tries fallback locators in order.

---

## Project Manager

Organize your automation targets (`/projects`).

### Projects

A project represents a target application:

- **Name**: Human-readable identifier
- **Base URL**: Root URL of the application
- **Screens**: Pages within the application
- **Elements**: UI elements on screens

### Screens

Screens represent pages or views:

- **Name**: e.g., "Dashboard", "Login Page"
- **URL Path**: e.g., "/dashboard", "/auth/login"
- **Elements**: Elements found on this screen

### Elements

Elements are UI components you interact with:

- **Name**: e.g., "Search Button", "Email Input"
- **Primary Locator**: Main way to find the element
- **Fallback Locators**: Backup strategies

---

## Cookie Manager

Manage authentication for protected applications (`/projects` → Cookie Manager).

### Auth Profiles

Store cookies for different authentication states:

- **Profile Name**: e.g., "Admin User", "Test Account"
- **Cookies**: Session cookies, auth tokens
- **Local Storage**: Optional local storage data
- **Session Storage**: Optional session storage data

### Using Auth Profiles

1. Create an auth profile
2. Add cookies manually or import from JSON
3. Use `setCookies` step in your flow to apply cookies

### Import/Export

Export profiles as JSON for backup or sharing:

```json
{
  "name": "Admin User",
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": ".example.com",
      "path": "/",
      "secure": true,
      "httpOnly": true
    }
  ]
}
```

---

## Step Types Reference

### Basic Steps

#### goto
Navigate to a URL or screen.

```json
{
  "type": "goto",
  "url": "https://example.com/dashboard",
  "narrate": "Opening the dashboard"
}
```

Or using screen reference:

```json
{
  "type": "goto",
  "screenId": "scr-dashboard",
  "narrate": "Opening the dashboard"
}
```

#### caption
Show text overlay on the page.

```json
{
  "type": "caption",
  "text": "This is the main navigation area",
  "placement": "bottom"
}
```

Placements: `top`, `center`, `bottom`

#### click
Click an element.

```json
{
  "type": "click",
  "elementId": "el-submit-btn",
  "narrate": "Clicking the submit button"
}
```

#### fill
Type into an input field.

```json
{
  "type": "fill",
  "elementId": "el-search-input",
  "value": "{{searchQuery}}",
  "narrate": "Entering the search term"
}
```

#### highlight
Highlight an element with a visual indicator.

```json
{
  "type": "highlight",
  "elementId": "el-error-code",
  "style": "pulse",
  "narrate": "This shows the error code"
}
```

Styles: `box`, `pulse`

#### waitFor
Wait for an element to reach a state.

```json
{
  "type": "waitFor",
  "elementId": "el-loading-spinner",
  "state": "hidden"
}
```

States: `visible`, `attached`, `hidden`

#### pause
Wait for a specified duration.

```json
{
  "type": "pause",
  "ms": 2000
}
```

### Advanced Steps

#### selectRow
Select a row in a table by matching text.

```json
{
  "type": "selectRow",
  "elementId": "el-transactions-table",
  "matchText": "{{transactionId}}",
  "narrate": "Selecting the transaction"
}
```

#### assertText
Verify that text exists on the page.

```json
{
  "type": "assertText",
  "text": "Success",
  "elementId": "el-status-message",
  "narrate": "Verifying the success message"
}
```

#### screenshot
Take a labeled screenshot.

```json
{
  "type": "screenshot",
  "label": "Final Result",
  "fullPage": false
}
```

#### scroll
Scroll the page or an element.

```json
{
  "type": "scroll",
  "direction": "down",
  "pixels": 500
}
```

Or scroll an element:

```json
{
  "type": "scroll",
  "direction": "bottom",
  "elementId": "el-scrollable-list"
}
```

Directions: `up`, `down`, `top`, `bottom`

#### hover
Hover over an element.

```json
{
  "type": "hover",
  "elementId": "el-dropdown-trigger",
  "narrate": "Hovering to show dropdown"
}
```

#### select
Select an option from a dropdown.

```json
{
  "type": "select",
  "elementId": "el-country-select",
  "value": "US",
  "narrate": "Selecting United States"
}
```

#### setCookies
Set cookies for authentication.

```json
{
  "type": "setCookies",
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": ".example.com",
      "path": "/",
      "secure": true,
      "httpOnly": false
    }
  ]
}
```

---

## API Reference

### Flows

```
GET  /flows              - List all flows
POST /flows              - Create a flow
GET  /flows/:id          - Get flow details
PUT  /flows/:id          - Update a flow
```

### Runs

```
GET  /runs               - List all runs
POST /runs               - Create and execute a run
GET  /runs/:id           - Get run details with artifacts
POST /runs/:id/retry     - Retry a failed run
```

### Projects

```
GET  /projects           - List all projects
POST /projects           - Create a project
```

### Screens

```
GET  /screens?projectId= - List screens for a project
POST /screens            - Create a screen
```

### Elements

```
GET  /elements?screenId= - List elements for a screen
POST /elements           - Create an element
```

### Auth Profiles

```
GET  /auth-profiles?projectId= - List auth profiles
POST /auth-profiles            - Create an auth profile
PUT  /auth-profiles/:id        - Update an auth profile
DELETE /auth-profiles/:id      - Delete an auth profile
```

### Artifacts

```
GET /artifacts/:id/download - Download an artifact
```

---

## Artifacts

Each flow run generates:

1. **Screenshots** (PNG) - One per step
2. **SRT Subtitles** - Timed narration text
3. **JSON Report** - Detailed execution log

### Report Format

```json
{
  "runId": "uuid",
  "flowId": "flow-id",
  "status": "succeeded",
  "startedAt": "2024-01-01T00:00:00Z",
  "finishedAt": "2024-01-01T00:01:00Z",
  "durationMs": 60000,
  "steps": [
    {
      "idx": 0,
      "type": "goto",
      "status": "ok",
      "durationMs": 2500,
      "narrate": "Opening the dashboard"
    }
  ]
}
```

### SRT Format

```srt
1
00:00:00,000 --> 00:00:03,000
Opening the dashboard

2
00:00:03,000 --> 00:00:06,000
This is the main navigation area
```
