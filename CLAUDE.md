# FigureOne

JavaScript/TypeScript library for drawing, animating, and interacting with shapes, text, plots, and equations in a browser using WebGL. No runtime dependencies.

## Environment

All Node/npm/npx commands must run inside the Docker container:

```sh
docker exec figureone_dev <command>
```

| Task | Command |
|------|---------|
| Type check | `docker exec figureone_dev npx tsc --noEmit` |
| Run all tests | `docker exec figureone_dev npm run jest` |
| Run specific test | `docker exec figureone_dev npx jest path/to/file.test.js` |
| Build (webpack + types) | `docker exec figureone_dev npm run webpack` |
| Build types only | `docker exec figureone_dev npm run build:types` |
| Lint | `docker exec figureone_dev npm run lint` |

## Project Structure

```
src/
  index.ts              # Entry point, exports the Fig global
  js/
    figure/
      Figure.ts         # Main Figure class
      Element.ts        # FigureElement, FigureElementPrimitive, FigureElementCollection
      SlideNavigator.ts # Slide-based presentation navigation
      Animation/        # Animation system (builder, steps)
      Equation/         # Equation rendering (layout functions, symbols, forms)
      FigurePrimitives/ # Shape primitives (polygon, rectangle, line, etc.)
      FigureCollections/# High-level collections (plot, axis, angle, line, etc.)
      Recorder/         # Interactive video recording/playback
      DrawingObjects/   # WebGL/HTML drawing objects
      geometries/       # Low-level geometry generation (lines, polygons, arcs)
      webgl/            # WebGL abstraction layer
    tools/
      g2.ts             # Re-exports Point, Transform, Line, Rect + geometry utils
      geometry/         # Core geometry classes (Point, Transform, Line, Rect, Scene)
      math.ts           # Math utilities (range, round, rand)
      tools.ts          # General utilities (joinObjects, NotificationManager)
      types.ts          # Shared types (TypeColor, OBJ_Font)
      FunctionMap.ts    # Function registry for recorder serialization
package/                # npm package output
  types/                # Generated .d.ts files (from tsconfig.build.json)
  llms.txt              # Concise API overview for coding agents
  llms-full.txt         # Comprehensive API reference for coding agents
docs/
  tutorials/            # Step-by-step tutorials (01-22)
  examples/             # Complete example projects
  api-typedoc/          # TypeDoc-based API documentation source
```

## TypeScript Migration

The codebase is migrating from Flow to TypeScript. Both `.js` (Flow) and `.ts` files coexist.

**Convention:** Create `.ts` alongside the existing `.js` file. Webpack resolves `.ts` first, so the `.js` file is kept but no longer used at build time. Test files stay as `.js`.

### Key rules

- **No `declare` on class fields.** Babel does NOT have `allowDeclareFields` enabled. Omit redundant field declarations in subclasses — the parent class declaration is sufficient.
- **`joinObjects<T>()`** is generic. Use `joinObjects<any>()` when the result type doesn't matter.
- **`joinObjectsWithOptions()`** returns `Record<string, any>` — property access works directly.

### Type mappings (Flow to TypeScript)

| Flow | TypeScript |
|------|-----------|
| `Object` | `Record<string, any>` |
| `mixed` | `any` |
| `?T` (maybe type) | `T \| null \| undefined` |
| `Image` | `HTMLImageElement` |
| Module-level `.bind(this)` | `.bind(undefined)` |

### Stub `.d.ts` files

When a `.ts` file imports from an unmigrated `.js` module in the figure layer, a `.d.ts` stub may be needed to satisfy the type checker.

## Code Style

- ESLint with `airbnb-base` + `jest` plugin
- Type prefixes: `OBJ_` (option objects), `COL_` (collection options), `EQN_` (equation types), `CPY_` (copy types), `Type` (type aliases)
- Test files: `*.test.js` colocated with source, use Jest with jsdom environment
- Colors: `[r, g, b, a]` arrays with values 0-1
- No `console.log` (ESLint error) — use the `Console` utility from `tools.ts` if needed

## Build

- Webpack bundles `src/index.ts` into `package/index.js` (dev) and `package/figureone.min.js` (prod)
- TypeScript declarations generated separately via `tsconfig.build.json` into `package/types/`
- The `Fig` global is exported as a UMD library
