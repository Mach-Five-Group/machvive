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
 */
const me = document.currentScript || document.querySelector('script[data-webmcp-cdn]');
const CDN = me?.dataset.webmcpCdn;
const PACKAGE = me?.dataset.webmcpPackage || '@machfivetechchicago/machvive-webmcp-ai';
const SEARCH_INDEX = me?.dataset.webmcpIndex || '/index.json';

if (!CDN) {
  console.warn('WebMCP site tools: missing data-webmcp-cdn; skipping.');
} else {
  boot().catch((err) => console.warn('WebMCP site tools failed to start:', err));
}

async function boot() {
  await import(`${CDN}/src/wc/machvive-webmcp-polyfill/machvive-webmcp-polyfill.js`);
  if (!navigator.modelContext) return; // plain-HTTP or unsupported context; polyfill declined

  const analytics = await import(`${CDN}/src/wc/machvive-webmcp-analytics/machvive-webmcp-analytics.js`);
  const { callLog, CALL_EVENT } = analytics;

  // Forward each captured call to GTM without mounting the analytics UI.
  window.addEventListener(CALL_EVENT, (e) => {
    if (e.detail?.reason === 'add' && e.detail.entry) callLog.pushToDataLayer(e.detail.entry.id);
  });

  navigator.modelContext.provideContext({ tools: siteTools() });
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
          query: { type: 'string', description: 'Words to look for' },
          limit: { type: 'integer', minimum: 1, maximum: 20, description: 'Maximum sections to return (default 5)' }
        },
        required: ['query']
      },
      execute: async ({ query, limit = 5 }) => {
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
