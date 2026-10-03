---
"@cloudflare/worker-bundler": patch
---

Preserve package subpaths when resolving packages without an exports map. Legacy main/module entrypoints now apply only to root imports. Fork workaround for cloudflare/agents#2466, based on worker-bundler 0.2.4; runtime dependency declarations are unchanged.
