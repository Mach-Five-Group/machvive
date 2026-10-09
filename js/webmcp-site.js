/**
 * machvive.com dogfoods its own product.
 *
 * This module makes the site agent-callable with the shipped package:
 *   1. the WebMCP polyfill installs navigator.modelContext (no-op if native)
 *   2. analytics wraps every registration so tool calls are captured
 *   3. three site tools are registered:
 *        get_install_command, search_docs, list_components
 *
 * Import order matters. Analytics must load before tools are registered or
 * those tools are invisible to it. Both imports are pinned to the version in
 * config.toml (cdnBase) and are resolved from the data attributes on this
 * script tag, so there is exactly one place to bump the version.
 *
 * Tool calls are forwarded to window.dataLayer (GTM) as `webmcp_tool_call`.
 *
 * Where a Mach Five Magnet is on the page, its lead-capture flow is bridged too,
 * so an agent can discover what the enquiry form asks and fill it in for the
 * visitor to confirm.
 */
const me = document.currentScript || document.querySelector('script[data-webmcp-cdn]');
const CDN = me?.dataset.webmcpCdn;
/** Declared on the schema as well as enforced, so a validator can see it. */
const MAX_QUERY = 200;
const PACKAGE = me?.dataset.webmcpPackage || '@machfivetechchicago/machvive-webmcp-ai';
const SEARCH_INDEX = me?.dataset.webmcpIndex || '/index.json';

if (!CDN) {
  console.warn('WebMCP site tools: missing data-webmcp-cdn; skipping.');
} else {
  boot().catch((err) => console.warn('WebMCP site tools failed to start:', err));
}

async function boot() {
  // One import, not two: the analytics module imports the polyfill itself, so
  // loading it separately first only added a round trip before any tool could
  // register. The modulepreload hints in head.html fetch the graph in parallel.
  const { callLog, CALL_EVENT } = await import(
    `${CDN}/src/wc/machvive-webmcp-analytics/machvive-webmcp-analytics.js`
  );
  if (!navigator.modelContext) return; // non-secure context; the polyfill declined

  // Forward each captured call to GTM without mounting the analytics UI.
  window.addEventListener(CALL_EVENT, (e) => {
    if (e.detail?.reason === 'add' && e.detail.entry) callLog.pushToDataLayer(e.detail.entry.id);
  });

  // registerTool, not provideContext: provideContext replaces the entire
  // toolset, so whichever of this module and the magnet bridge finished last
  // would erase the other's tools.
  for (const tool of siteTools()) navigator.modelContext.registerTool(tool);

  await bridgeProducts();
  await bridgeMagnet();
}

/**
 * Publishes the site's own catalogue, when the page carries product JSON-LD.
 *
 * The markup is in layouts/partials/products-jsonld.html and exists for search
 * engines regardless. The component reads that same block and exposes
 * search_products, get_product and list_product_facets — no second copy of the
 * data, and nothing to keep in sync.
 */
async function bridgeProducts() {
  if (!document.querySelector('script[type="application/ld+json"]')) return;
  try {
    await import(`${CDN}/src/wc/machvive-webmcp-products/machvive-webmcp-products.js`);
    if (!document.querySelector('machvive-webmcp-products')) {
      const el = document.createElement('machvive-webmcp-products');
      el.hidden = true;        // the tools are the point here, not the status line
      document.body.append(el);
    }
  } catch (err) {
    // The site's own tools are already registered; this must not take them down.
    console.warn('WebMCP products bridge failed to start:', err);
  }
}

/**
 * Bridges a Mach Five Magnet, when the page carries one.
 *
 * The magnet snippet is already in the markup (see layouts/partials/scripts.html
 * and content/contact.md), so the element needs no app-guid or src — it detects
 * the loaded runtime and derives its tools from that magnet's own configuration.
 */
async function bridgeMagnet() {
  if (!document.querySelector('script[src*="coreSnippet"]')) return;
  try {
    await import(`${CDN}/src/wc/machvive-m5t-magnet/machvive-m5t-magnet.js`);
    if (!document.querySelector('machvive-m5t-magnet')) {
      document.body.append(document.createElement('machvive-m5t-magnet'));
    }
  } catch (err) {
    // The site's own tools are already registered; a magnet failure must not
    // take them down with it.
    console.warn('WebMCP magnet bridge failed to start:', err);
  }
}

const COMPONENTS = [
  {
    tag: 'machvive-webmcp-polyfill',
    subpath: 'webmcp-polyfill',
    summary: 'Installs navigator.modelContext (registerTool, unregisterTool, provideContext) so a page can expose tools to AI agents. No-op when the browser ships WebMCP natively.'
  },
  {
    tag: 'machvive-webmcp-inspect',
    subpath: 'webmcp-inspect',
    summary: 'Lists registered tools, builds a form from each inputSchema, and runs them. Inline by default; add the floating attribute to dock it as an overlay.'
  },
  {
    tag: 'machvive-webmcp-analytics',
    subpath: 'webmcp-analytics',
    summary: 'Captures every tool call (params, result, duration, errors) for listing, editing, export, replay, and opt-in dataLayer push. Persists to IndexedDB.'
  },
  {
    tag: 'machvive-lorum-ipsum',
    subpath: 'lorum-ipsum',
    summary: 'Placeholder copy that projects slotted content. Unrelated to WebMCP.'
  }
];

function siteTools() {
  return [
    {
      name: 'get_install_command',
      description: `Return the npm install command and buildless CDN import for the MachVive package (${PACKAGE}).`,
      inputSchema: {
        type: 'object',
        properties: {
          manager: { type: 'string', enum: ['npm', 'yarn', 'pnpm', 'cdn'], description: 'Package manager, or "cdn" for a no-build module script' }
        }
      },
      execute: ({ manager = 'npm' } = {}) => {
        const cmds = {
          npm: `npm install ${PACKAGE}`,
          yarn: `yarn add ${PACKAGE}`,
          pnpm: `pnpm add ${PACKAGE}`,
          cdn: `<script type="module" src="${CDN}/index.js"></script>`
        };
        return cmds[manager] || cmds.npm;
      }
    },
    {
      name: 'list_components',
      description: 'List the MachVive web components with their tag, import subpath, and purpose.',
      inputSchema: { type: 'object', properties: {} },
      execute: () =>
        COMPONENTS.map((c) => `<${c.tag}>  import '${PACKAGE}/${c.subpath}'\n  ${c.summary}`).join('\n\n')
    },
    {
      name: 'search_docs',
      description: 'Search the MachVive documentation on machvive.com and return matching sections with a URL, heading, and excerpt.',
      inputSchema: {
        type: 'object',
        properties: {
          // minLength/maxLength declared, not just enforced. `limit` was already
          // bounded here while `query` was not, and a constraint that exists
          // only in the implementation is invisible to a validator and to an
          // agent planning a call.
          query: { type: 'string', minLength: 1, maxLength: MAX_QUERY, description: 'Words to look for' },
          limit: { type: 'integer', minimum: 1, maximum: 20, default: 5, description: 'Maximum sections to return (default 5)' }
        },
        required: ['query']
      },
      execute: async ({ query, limit = 5 }) => {
        // Refused with a reason rather than truncated: shortening a query
        // answers a question the agent did not ask, and it cannot tell.
        if (typeof query !== 'string' || !query.trim()) return 'query is required.';
        if (query.length > MAX_QUERY) {
          return `query must be ${MAX_QUERY} characters or fewer (received ${query.length}).`;
        }
        const hits = await searchIndex(query, limit);
        if (!hits.length) return `No documentation sections matched "${query}". Try /llms.txt for an overview.`;
        return hits
          .map((h) => `${h.title} › ${h.heading}\n${h.url}\n${h.excerpt}`)
          .join('\n\n');
      }
    }
  ];
}

let indexPromise;
async function loadIndex() {
  indexPromise ||= fetch(SEARCH_INDEX).then((r) => {
    if (!r.ok) throw new Error(`search index ${r.status}`);
    return r.json();
  });
  return indexPromise;
}

async function searchIndex(query, limit) {
  const terms = String(query).toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const index = await loadIndex();
  const scored = [];
  for (const page of index) {
    for (const section of page.sections) {
      const hay = `${section.heading} ${section.text}`.toLowerCase();
      let score = 0;
      for (const t of terms) {
        const inHeading = section.heading.toLowerCase().includes(t);
        const count = hay.split(t).length - 1;
        if (count) score += count + (inHeading ? 5 : 0);
      }
      if (score) scored.push({ score, title: page.title, heading: section.heading, url: page.url + (section.anchor ? '#' + section.anchor : ''), excerpt: excerpt(section.text, terms) });
    }
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function excerpt(text, terms) {
  const lower = text.toLowerCase();
  let at = -1;
  for (const t of terms) { at = lower.indexOf(t); if (at >= 0) break; }
  const start = Math.max(0, at - 80);
  const slice = text.slice(start, start + 240).replace(/\s+/g, ' ').trim();
  return (start > 0 ? '…' : '') + slice + (start + 240 < text.length ? '…' : '');
}
