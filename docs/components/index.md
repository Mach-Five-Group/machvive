# Components

> Attributes, exports and behaviour of each MachVive web component: the WebMCP polyfill, the inspector, analytics, and theming.

Source: https://www.machvive.com/docs/components/
Site: https://www.machvive.com/ · Overview for agents: https://www.machvive.com/llms.txt

Four custom elements ship in `@machfivetechchicago/machvive-webmcp-ai`. Each is a standards-based custom element with Shadow DOM, and each registers itself when its module is imported.

## Polyfill

```html
<machvive-webmcp-polyfill></machvive-webmcp-polyfill>
```

```javascript
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-polyfill';
```

Installs `navigator.modelContext` following the [W3C WebMCP proposal](https://webmachinelearning.github.io/webmcp/docs/proposal.html). It is a no-op when the browser already implements WebMCP, so your page always talks to the real implementation where one exists. Installation happens on import, not on element upgrade, so you can register tools without waiting for the tag.

**Standard members**

- `registerTool(tool)` adds one tool. `tool` has `name`, `description`, `inputSchema` (JSON Schema) and `execute(params, agent)`.
- `unregisterTool(name)` removes one tool.
- `provideContext({ tools })` replaces the whole toolset, for when app state changes which tools make sense.

**Non-standard extensions.** The spec defines registration only. The polyfill adds two members so page code can bridge to an agent. Do not assume a native implementation provides them.

- `navigator.modelContext.tools` returns descriptors without handlers.
- `navigator.modelContext.callTool(name, params)` invokes a tool. It never rejects. Failures return `{ content: [...], isError: true }`.

**Return values.** An `execute` handler may return `{ content: [{ type: 'text', text }] }`, a plain string, or any JSON value. Strings and values are normalised to the content shape.

**Events.** `machvive-webmcp-change` fires on `window` whenever the toolset changes, with `event.detail.tools`. The constant `TOOLS_CHANGED_EVENT` is exported.

**Exports:** `MachviveWebmcpPolyfill`, `installWebmcpPolyfill`, `TOOLS_CHANGED_EVENT`.

## Inspector

```html
<!-- inline: renders where you place it -->
<machvive-webmcp-inspect></machvive-webmcp-inspect>

<!-- floating: docks as an overlay panel with a toggle -->
<machvive-webmcp-inspect floating></machvive-webmcp-inspect>

<!-- floating and expanded on load -->
<machvive-webmcp-inspect floating open></machvive-webmcp-inspect>
```

```javascript
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-inspect';
```

Lists every registered tool, renders a form from its `inputSchema`, and executes it with what you type. Values are coerced to the schema's types. An `integer` field sends `3`, not `"3"`. Required fields are enforced before anything runs. `object` and `array` fields accept JSON. The list refreshes as tools are registered or removed.

**Attributes:** `floating`, `open`, `theme`.

**Methods:** `show()` and `hide()` drive the panel from script in floating mode.

## Analytics

```html
<machvive-webmcp-analytics></machvive-webmcp-analytics>
```

```javascript
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-analytics';
```

Captures every WebMCP invocation with params, result, duration and errors, then lets you list, edit, export, replay or forward them.

**Import it before you register tools.** Capture works by wrapping each tool's handler at registration time. Anything registered earlier is invisible, and the component warns in the console when it detects this. Wrapping the handler rather than the caller is deliberate: it records invocations from any caller, including a native `navigator.modelContext` and real agents.

Captured calls persist to IndexedDB, so a log survives reloads. The store degrades to memory-only where IndexedDB is unavailable. The default cap is 500 entries, oldest evicted first. Recording is best-effort: a failure inside the log can never change a tool's result.

**Working with the log**

```javascript
import { callLog } from '@machfivetechchicago/machvive-webmcp-ai/webmcp-analytics';

await callLog.ready;            // restore from IndexedDB is async
callLog.entries;                // captured calls, oldest first
callLog.toJSON();               // export as JSON
callLog.import(json);           // merge a previously exported log
callLog.update(id, { params }); // edit before replaying
await callLog.replay(id);                    // re-run as captured
await callLog.replay(id, { sku: 'OTHER' });  // re-run with edited params
```

**Google Tag Manager.** Pushing to `window.dataLayer` is off unless you opt in, so importing the component never emits tracking traffic on its own.

```html
<machvive-webmcp-analytics datalayer></machvive-webmcp-analytics>
```

Each call then pushes `{ event: 'webmcp_tool_call', webmcp_tool, webmcp_status, webmcp_duration_ms, webmcp_params }`. Without the attribute, push individual entries with `callLog.pushToDataLayer(id)` or the per-entry button in the UI.

**Events.** `machvive-webmcp-call` fires on `window` when the log changes, with `event.detail.reason` (`add`, `update`, `remove`, `clear`, `import`, `restore`) and `event.detail.entry`. The constant `CALL_EVENT` is exported.

**Attributes:** `datalayer`, `theme`.

**Exports:** `MachviveWebmcpAnalytics`, `CallLog`, `callLog`, `installAnalytics`, `CALL_EVENT`.

## Lorum Ipsum

```html
<machvive-lorum-ipsum></machvive-lorum-ipsum>
```

Placeholder copy that projects slotted content. Unrelated to WebMCP. Useful for layout work while the real components are wired up.

## Theming

The UI components follow the viewer's OS preference automatically. Set `theme` to override:

```html
<machvive-webmcp-inspect></machvive-webmcp-inspect>               <!-- follows the OS -->
<machvive-webmcp-analytics theme="dark"></machvive-webmcp-analytics>
<machvive-webmcp-inspect theme="light"></machvive-webmcp-inspect>
```

`theme` is a reflected property, so `el.theme = 'dark'` and `el.theme = null` work from script.

Colors are CSS custom properties on the host. Custom properties inherit through shadow boundaries, so you can restyle from your own stylesheet without `::part` or `!important`:

```css
machvive-webmcp-inspect,
machvive-webmcp-analytics {
  --mv-accent: #7c3aed;
  --mv-bg: #ffffff;
  --mv-fg: #111827;
  --mv-border: #e5e7eb;
}
```

| Token | Role |
| --- | --- |
| `--mv-fg` / `--mv-muted` / `--mv-faint` | Text: primary, secondary, hints |
| `--mv-bg` / `--mv-surface` / `--mv-input-bg` | Panel, raised areas, form fields |
| `--mv-border` / `--mv-border-soft` / `--mv-control-border` | Outlines, dividers, controls |
| `--mv-hover` / `--mv-selected` | Interactive states |
| `--mv-accent` / `--mv-accent-fg` | Primary button |
| `--mv-ok-bg` / `--mv-ok-fg` / `--mv-err-bg` / `--mv-err-fg` | Status badges |
| `--mv-danger` / `--mv-danger-border` | Destructive actions |

Every combination of OS preference and `theme` meets WCAG AA contrast across the full UI. If you override tokens, re-check your own contrast.

## TypeScript

Declarations ship with the package. Importing a component augments `HTMLElementTagNameMap`, so `querySelector` returns the real element type, and the polyfill declares `navigator.modelContext` plus the change event.

```typescript
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-polyfill';
import type { WebmcpToolResult } from '@machfivetechchicago/machvive-webmcp-ai';

const el = document.querySelector('machvive-webmcp-inspect'); // MachviveWebmcpInspect | null
const res: WebmcpToolResult = await navigator.modelContext.callTool('add_to_cart', { sku: 'A' });
```

Verified against `moduleResolution: "bundler"` and `"node16"` under `--strict`.

## Further reading

The [project wiki](https://github.com/Mach-Five-Group/machvive-webmcp-ai/wiki) covers architecture notes, why WebMCP beats scripted clicking, and the constraints worth knowing before you adopt.

