# @coderail-flow/dsl

Define browser automation flows with typed Zod schemas.

## Install

```bash
npm install @coderail-flow/dsl
```

## Usage

```typescript
import { StepSchema, FlowSchema } from '@coderail-flow/dsl';

const flow = FlowSchema.parse({
  steps: [
    { type: 'goto', url: 'https://example.com' },
    { type: 'click', elementId: 'login-btn' },
    { type: 'fill', elementId: 'email', value: 'user@test.com' },
    { type: 'screenshot', label: 'after-login' },
  ]
});
```

## Step Types

goto, caption, click, fill, highlight, waitFor, pause, selectRow, assertText, screenshot, scroll, hover, select, setCookies

## Links

- [CodeRailFlow](https://coderail.dev)
- [App](https://flow.coderail.dev)
- [GitHub](https://github.com/finsavvyai/coderail-flow)
