# About MachVive

> MachVive is an open source WebMCP toolset built by Mach Five Tech. It turns your product into a tool any AI agent can call.

Source: https://www.machvive.com/about/
Site: https://www.machvive.com/ · Overview for agents: https://www.machvive.com/llms.txt

# About MachVive

## What is MachVive?

MachVive started from one sentence we kept hearing from customers: "I don't want to use your product's agent. I want my agent to be able to use your product."

WebMCP is the emerging browser standard that makes that possible. A page can expose named, schema-typed tools through `navigator.modelContext`, and an agent running in the browser, in an extension, or in a client like Claude or ChatGPT can discover and call them. MachVive is the toolset that makes exposing those tools as easy as dropping a custom tag into your markup.

It ships as one npm package of vanilla web components with zero runtime dependencies and no build step. A polyfill installs WebMCP where the browser lacks it and steps aside where it doesn't. An inspector shows you exactly what an agent sees. Analytics capture every call so you can understand how agents actually use your product.

## What we believe

- **Native first.** If the browser already provides a model context, use it. Only polyfill when it doesn't.
- **Buildless.** A site should be able to load one module from a CDN. No bundler, no node_modules, no build step.
- **Declarative.** HTML first. The tool schema lives with the component, not in a separate config file.
- **Measurable.** If agents are part of your customer journey, you need to see how they engage. Record, replay, export.
- **Open.** Apache 2.0, with an explicit patent grant. Build proprietary features on top without being forced to open source your own work.

## Who builds it

MachVive is built by Mach Five Tech in Chicago, a Mach Five Group company. The npm scope is `@machfivetechchicago` because the shorter name was already taken.

## More from Mach Five

<div class="mach-five-ecosystem">
<div class="ecosystem-card">
<div class="ecosystem-logo ecosystem-logo-tech">
<span class="ecosystem-number">5</span>
</div>
<h3>Mach Five Tech</h3>
<p>The developer of MachVive. Custom software development and technical consulting for enterprise-grade applications.</p>
<a href="https://www.machfivetech.com" target="_blank" class="ecosystem-link">Visit Mach Five Tech →</a>
</div>
<div class="ecosystem-card">
<div class="ecosystem-logo ecosystem-logo-group">
<span class="ecosystem-number">5</span>
</div>
<h3>Mach Five Group</h3>
<p>Our parent company specializing in strategic technology consulting and digital transformation solutions.</p>
<a href="https://www.machfivegroup.com" target="_blank" class="ecosystem-link">Visit Mach Five Group →</a>
</div>
<div class="ecosystem-card">
<div class="ecosystem-logo ecosystem-logo-marketing">
<span class="ecosystem-number">5</span>
</div>
<h3>Mach Five Marketing</h3>
<p>Performance-driven marketing agency focused on data analytics and conversion optimization.</p>
<a href="https://www.machfivemarketing.com" target="_blank" class="ecosystem-link">Visit Mach Five Marketing →</a>
</div>
</div>
