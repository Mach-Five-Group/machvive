# Quick Start

> Register your first WebMCP tool, see it in the inspector, and call it the way an agent would. About five minutes, no build step.

Source: https://www.machvive.com/docs/quick-start/
Site: https://www.machvive.com/ · Overview for agents: https://www.machvive.com/llms.txt

You'll put the polyfill and the inspector on a page, register one tool, and call it two ways: from the inspector and from the console. No bundler needed.

## 1. Create the page

Save this as `index.html` and serve it from a local server such as `http://localhost:5500/`. WebMCP needs a secure context, so `localhost` works and a `file://` URL does not.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MachVive Quick Start</title>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@machfivetechchicago/machvive-webmcp-ai@5.7.1/index.js"></script>
</head>
<body>
  <h1>Quick Start</h1>
  <p id="cart">Cart is empty.</p>

  <!-- floating inspector, docked bottom-right -->
  <machvive-webmcp-inspect floating open></machvive-webmcp-inspect>

  <script type="module">
    // The bulk import above already installed navigator.modelContext.
    navigator.modelContext.registerTool({
      name: 'add_to_cart',
      description: 'Add a product to the shopping cart',
      inputSchema: {
        type: 'object',
        properties: {
          sku: { type: 'string', description: 'Product SKU' },
          qty: { type: 'integer', minimum: 1, description: 'Quantity (default 1)' }
        },
        required: ['sku']
      },
      execute: async ({ sku, qty = 1 }) => {
        document.getElementById('cart').textContent = `Cart: ${qty} × ${sku}`;
        return { content: [{ type: 'text', text: `Added ${qty} × ${sku} to cart.` }] };
      }
    });
  </script>
</body>
</html>
```

## 2. Run it from the inspector

The inspector panel lists `add_to_cart` with a form built from its schema. Type a SKU, set a quantity, and run it. The `qty` field sends an integer, not a string, because the schema says so. Required fields are enforced before anything runs.

The paragraph on the page updates. The visitor and the agent see the same state.

## 3. Call it from the console

This is what a bridge or an agent does under the hood:

```js
navigator.modelContext.tools;
// [{ name: 'add_to_cart', description: '...', inputSchema: {...} }]

await navigator.modelContext.callTool('add_to_cart', { sku: 'M5T-001', qty: 2 });
// { content: [{ type: 'text', text: 'Added 2 × M5T-001 to cart.' }] }
```

`callTool` never throws. A handler that rejects comes back as `{ content: [...], isError: true }`.

Listen for the toolset changing:

```js
window.addEventListener('machvive-webmcp-change', (e) => console.log(e.detail.tools));
```

## 4. Capture the calls

Add the analytics element and every invocation is recorded with params, result, duration and errors. The log persists to IndexedDB and survives reloads.

```html
<machvive-webmcp-analytics></machvive-webmcp-analytics>
```

The bulk import loads analytics before your tool registers, which is what you want. If you cherry-pick imports, import analytics before you register any tool, or those tools are invisible to it.

To forward calls to Google Tag Manager, opt in with the `datalayer` attribute:

```html
<machvive-webmcp-analytics datalayer></machvive-webmcp-analytics>
```

## 5. Try it on this site

Every page on machvive.com registers `get_install_command`, `search_docs` and `list_components`. Open the floating inspector on this page and run `search_docs` with the query `secure context`.

## Where to go from here

- Swap the demo for a real action in your product: a search, a quote, a booking, a status check.
- Keep the name, description and schema honest. That text is what an agent reads to decide whether to call you.
- Read [Components](/docs/components/) for every attribute and export.

