# Detailed Changelog

## 2026-04-20 — Graceful WebGL unavailability

**Why this exists**

On resource-constrained hardware (or when too many WebGL contexts are already in use on a page), the browser can refuse to give FigureOne a WebGL context. Previously this threw during `new Figure(...)` and broke the surrounding app. It could also crash later if the browser *lost* an active context and your code kept adding elements or drawing in the meantime — common in React reloads or tab-switching scenarios.

Figures now tolerate all three states: **never got a context**, **context lost mid-run**, and **context restored**. The figure stays constructible and usable; rendering silently no-ops while unavailable and resumes when a context is available.

**What you can use**

1. **Construction-time callback** — pass `onWebGLUnavailable` to the `Figure` options. Fires once if the browser refuses the initial context.
   ```js
   new Fig.Figure({
     scene: [-1, -1, 1, 1],
     onWebGLUnavailable: () => showFallbackUI(),
   });
   ```

2. **`figure.webglAvailable`** — boolean getter. `true` when a live context is attached, `false` otherwise. Reflects the initial-unavailable state *and* runtime context loss/restore. Safe to read at any time.

3. **`contextLost` / `contextRestored` notifications** — subscribe via the existing notifications system for runtime transitions:
   ```js
   figure.notifications.add('contextLost', () => { /* pause UI, show banner */ });
   figure.notifications.add('contextRestored', () => { /* resume */ });
   ```

**What you don't need to do**

- No guards around `figure.add(...)` while the context is lost — elements can be added and will render once the context returns.
- No guards around the draw loop — draws during loss are no-ops.
- No changes to existing Figure code. These are purely additive; ignoring them keeps old behaviour (minus the crash).

**Recommended integration**

- If you have a fallback UI, wire `onWebGLUnavailable` to show it.
- If you care about runtime loss (long-running dashboards, tab-switching), subscribe to `contextLost` / `contextRestored` to pause/resume app logic that assumes frames are rendering.
- For anything else, no action needed — the crash is just gone.
