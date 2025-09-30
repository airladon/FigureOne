# Flow to TypeScript migration plan

This repo currently uses Flow (see `// @flow` headers and `.flowconfig`). The plan below enables an incremental migration to TypeScript without breaking the current build/tests.

## What changed in this PR

- Added `tsconfig.json` configured for incremental TS (no emit) alongside JS.
- Updated `.babelrc` to include `@babel/preset-typescript` so Babel can transpile `.ts/.tsx` files.
- Updated webpack to resolve `.ts/.tsx` and transpile them with `babel-loader`.
- Updated Jest to transform TS files via `babel-jest` and match `.[tj]s` tests.
- Added `global.d.ts` with ambient module declarations for `*.worker.js` and common asset imports used by webpack, plus Jest globals.

No JS files were changed yet. Flow continues to work as-is via `@babel/preset-flow` and the `flow` script.

## Install dependencies

Dev-only:

```
npm i -D typescript @types/jest @types/node @babel/preset-typescript
```

## Convert gradually

1. For any file you want to migrate, rename `file.js` to `file.ts` (or `file.tsx` if it contains JSX) and replace Flow-specific syntax:
   - Remove `// @flow` pragma.
   - Replace `import type { T } from 'x'` with standard TS `import { type T } from 'x'` (TS type-only imports are optional) or `import type { T } from 'x'` when using TS 5+.
   - Flow `?T` becomes `T | null | undefined` (or just `T | null` if only null is intended).
   - Flow exact objects `{| a: number |}` map to TS's default object shape `{ a: number }` (TS is exact by default). For dictionary objects, use index signatures.
   - Replace Flow utility types with TS equivalents (see below).
2. If a file still references `*.worker.js` imports, leave them; the ambient module in `global.d.ts` provides types.
3. Keep mixed code: webpack/Jest handle `.js` and `.ts` simultaneously.

## Common Flow → TS mappings used here

- `?T` → `T | null | undefined`
- `mixed` → `unknown` (or `any` if you truly need it)
- `{ [k: string]: T }` is valid in both; for Flow exact object `{| |}`, just use TS object literal.
- Flow exact object `{| a: number |}` → `type T = { a: number }` (TS is exact by default)
- `Class<X>` → `new (...args: any[]) => X`
- `$Keys<typeof obj>` → `keyof typeof obj`
- `$Values<typeof obj>` → `(typeof obj)[keyof typeof obj]`
- `$ReadOnly<T>` → `Readonly<T>`
- `Array<T>` stays `Array<T>` or `T[]`

Add any helper types you need to `src/ts-migration.d.ts` as you go.

## Type-check and test

- Type-check: `npx tsc --noEmit`
- Run tests: `npm run jest`
- Build: your existing webpack builds pick up `.ts` automatically.

## When fully migrated

- Remove `.flowconfig`, `@babel/preset-flow`, Flow scripts and dev deps.
- Optionally enable `allowJs: true` + `checkJs: true` transiently if you want TS to check remaining JS.
