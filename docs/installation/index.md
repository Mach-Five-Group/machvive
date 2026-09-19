# Installation

> Install MachVive from npm or load it buildless from a CDN, then read the two constraints that cause most integration failures.

Source: https://www.machvive.com/docs/installation/
Site: https://www.machvive.com/ · Overview for agents: https://www.machvive.com/llms.txt

MachVive is a single npm package of vanilla web components. Install it with a package manager, or load one module script from a CDN with no build step.

## npm

```bash
npm install @machfivetechchicago/machvive-webmcp-ai
```

```bash
yarn add @machfivetechchicago/machvive-webmcp-ai
```

```bash
pnpm add @machfivetechchicago/machvive-webmcp-ai
```

Then import what you need in your entry script. Importing a module registers its custom element. There is no init function to call.

```javascript
// Cherry-pick for smaller bundles
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-polyfill';
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-inspect';
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-analytics';

// Or register all components at once
import '@machfivetechchicago/machvive-webmcp-ai';
```

The subpaths are `/webmcp-polyfill`, `/webmcp-inspect`, `/webmcp-analytics` and `/lorum-ipsum`.

## Buildless (CDN)

No bundler, no `node_modules`, no build step. Pin a version and load the module directly. This site loads the package this way.

```html
<!-- everything -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@machfivetechchicago/machvive-webmcp-ai@5.7.1/index.js"></script>

<!-- or one component -->
<script type="module" src="https://cdn.jsdelivr.net/npm/@machfivetechchicago/machvive-webmcp-ai@5.7.1/src/wc/machvive-webmcp-polyfill/machvive-webmcp-polyfill.js"></script>
```

Always pin an exact version in production.

## Secure context is required

`navigator.modelContext` is a `[SecureContext]` API, so the polyfill installs only on HTTPS and on `localhost`. On plain HTTP it declines with a console warning and `navigator.modelContext` stays undefined. Serve your page from a local server during development. Opening a file from disk will not work.

## Server-side rendering

These are browser components. Each one extends `HTMLElement` at module load, so importing the package during a server render throws:

```text
ReferenceError: HTMLElement is not defined
```

This never happens in a browser-only setup like Vite. In Next.js, Nuxt, Astro, SvelteKit or Remix, import from a client-only lifecycle hook with a dynamic import. A static top-level import will not work.

```javascript
// Next.js App Router: mark the component "use client", then import on mount
'use client';
import { useEffect } from 'react';

export default function Page() {
  useEffect(() => { import('@machfivetechchicago/machvive-webmcp-ai'); }, []);
  return <machvive-webmcp-inspect floating></machvive-webmcp-inspect>;
}
```

```javascript
// Nuxt
onMounted(() => import('@machfivetechchicago/machvive-webmcp-ai'));

// SvelteKit
import { onMount } from 'svelte';
onMount(() => import('@machfivetechchicago/machvive-webmcp-ai'));
```

In Astro, put the import in a `<script>` tag rather than in the component's frontmatter.

## Bundler note

Never set `"sideEffects": false` for this package. Components self-register with `customElements.define()`, and tree-shaking a bare side-effect import silently drops the tag registration.

## TypeScript

Declarations ship with the package. No `@types/*` install is needed. Importing a component augments `HTMLElementTagNameMap`, and the polyfill declares `navigator.modelContext`.

```typescript
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-polyfill';
import type { WebmcpToolResult } from '@machfivetechchicago/machvive-webmcp-ai';

const res: WebmcpToolResult = await navigator.modelContext.callTool('add_to_cart', { sku: 'A' });
```

## Verification

Load the polyfill, then run this in the DevTools console on an HTTPS or localhost page:

```js
console.log(typeof navigator.modelContext); // "object"
console.log(navigator.modelContext.tools);  // [] until you register something
```

## What's next

- [Quick Start](/docs/quick-start/) registers a tool and calls it.
- [Components](/docs/components/) documents each element.

## Troubleshooting

**`navigator.modelContext` is undefined.**
- The page is on plain HTTP. Use HTTPS or `localhost`.
- The polyfill module did not load. Check the Network tab for the script.

**`HTMLElement is not defined` on the server.**
- You imported the package during SSR. Move the import into a client-only hook with `import()`.

**A component tag renders nothing.**
- Its module was never imported, or a bundler tree-shook the side-effect import. Check `sideEffects`.

**Analytics shows an empty log.**
- Tools were registered before the analytics module loaded. Import analytics first.

Need more help? Open an issue on [GitHub](https://github.com/Mach-Five-Group/machvive-webmcp-ai/issues) or [reach the team](/contact/).

