# MachVive Documentation

> Make your product a tool any AI agent can call. Vanilla web components that polyfill WebMCP, inspect registered tools, and capture every call.

Source: https://www.machvive.com/docs/
Site: https://www.machvive.com/ · Overview for agents: https://www.machvive.com/llms.txt

MachVive is an open source WebMCP toolset. It ships as one npm package of vanilla web components, with zero runtime dependencies and no build step.

> "I don't want to use your product's agent. I want my agent to be able to use your product."

## What WebMCP is

WebMCP is a W3C Web Machine Learning Community Group proposal. A page declares named, schema-typed functions on `navigator.modelContext`, and an agent calls them directly instead of scraping the DOM and simulating clicks. No browser ships it natively yet. MachVive polyfills it, and steps aside when a native implementation appears.

## The components

| Component | Tag | What it does |
| --- | --- | --- |
| Polyfill | `<machvive-webmcp-polyfill>` | Installs `navigator.modelContext` so a page can expose tools |
| Inspector | `<machvive-webmcp-inspect>` | Lists registered tools, builds a form from each schema, runs them |
| Analytics | `<machvive-webmcp-analytics>` | Captures every tool call for listing, editing, export, replay and dataLayer |
| Lorum Ipsum | `<machvive-lorum-ipsum>` | Placeholder copy that projects slotted content |

## How it works

1. Import the polyfill. It installs `navigator.modelContext` immediately, or does nothing if the browser already has one.
2. Register a tool with a name, a description, a JSON schema for its input, and an `execute` handler.
3. An agent, an extension, or the inspector discovers the tool and calls it. The handler runs your real product code and returns a result.

```javascript
import '@machfivetechchicago/machvive-webmcp-ai/webmcp-polyfill';

navigator.modelContext.registerTool({
  name: 'add_to_cart',
  description: 'Add a product to the shopping cart',
  inputSchema: {
    type: 'object',
    properties: { sku: { type: 'string', description: 'Product SKU' } },
    required: ['sku']
  },
  execute: async ({ sku }) => {
    await cart.add(sku);
    return { content: [{ type: 'text', text: `Added ${sku} to cart.` }] };
  }
});
```

## This site is agent-callable

machvive.com runs on the package it documents. Every page registers three tools: `get_install_command`, `search_docs` and `list_components`. Open the floating inspector in the corner of any docs page to see them, fill in a form, and run one. That is exactly what an agent sees.

## Where to go next

1. [Installation](/docs/installation/) covers npm, the buildless CDN path, and the two constraints that trip people up.
2. [Quick Start](/docs/quick-start/) registers a tool, inspects it, and calls it.
3. [Components](/docs/components/) documents each element's attributes and API, theming, and TypeScript.

For agents: an overview lives at [/llms.txt](/llms.txt), the full docs in one file at [/llms-full.txt](/llms-full.txt), and every docs page has a Markdown mirror at its URL plus `index.md`.

## Getting help

- [Project wiki](https://github.com/Mach-Five-Group/machvive-webmcp-ai/wiki) for the full guide and adoption constraints
- [GitHub issues](https://github.com/Mach-Five-Group/machvive-webmcp-ai/issues) for bugs and requests
- [Reach the team](/contact/) for evaluations or enterprise support

---

*MachVive is built by [Mach Five Tech](https://www.machfivetech.com), a Mach Five Group company, and is open source under Apache 2.0.*


## Pages in this section

- [Components](https://www.machvive.com/docs/components/) · Markdown: https://www.machvive.com/docs/components/index.md
- [Installation](https://www.machvive.com/docs/installation/) · Markdown: https://www.machvive.com/docs/installation/index.md
- [Quick Start](https://www.machvive.com/docs/quick-start/) · Markdown: https://www.machvive.com/docs/quick-start/index.md
