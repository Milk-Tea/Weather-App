# Project Guidelines

## Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (utility classes in JSX, no CSS-in-JS; theme/animations defined in `src/index.css` via `@theme`, no `tailwind.config.js`)
- **Testing**: Vitest + Testing Library
- **Package manager**: Yarn

## Imports

Group imports in this order, with a blank line between each group:

1. React / framework
2. Third-party packages
3. Absolute project imports
4. Relative imports

## Code style

- Comments should explain *why*, not *what*. Avoid comments that simply restate the code.
- Prefer duplication over premature abstraction. Extract shared logic once it has demonstrated reuse or meaningfully improves readability.
- Don't add defensive code for impossible states guaranteed by the framework or type system. Handle realistic failure modes only.
- Avoid temporary compatibility layers or feature flags unless they're required for a staged rollout.
- Prefer early returns (guard clauses) over deeply nested conditionals.
- Prefer clear, descriptive names over abbreviations.
- Keep functions focused on a single responsibility.

## TypeScript

- Strict mode enabled. Avoid `any`.
- Narrow types with type guards instead of type assertions where possible.
- Avoid non-null assertions (`!`) unless the invariant is obvious.
- Prefer discriminated unions over optional fields when modelling mutually exclusive states.
- Use `type` imports (`import type { Foo }`) wherever the import is only used as a type.
- Define all API response shapes explicitly.

## React

- Prefer keeping business logic and asynchronous data fetching inside custom hooks. Components should primarily focus on rendering.
- Avoid `useEffect` unless synchronising with an external system. Derived state belongs in render.
- Compute derived values during render instead of storing them in state.
- Keep state as local as possible. Avoid lifting state unless multiple consumers require it.
- Don't use `useMemo` or `useCallback` unless they solve a measurable performance or referential equality problem.
- Never use array indices as React keys when stable identifiers exist.
- Use `onMouseDown` instead of `onClick` on dropdown items to prevent blur from firing before selection.
- Animations via Tailwind's `animate-*` utilities (defined in `src/index.css` via `@theme` custom properties + `@keyframes`).

## Accessibility

- Use semantic HTML before adding ARIA attributes. ARIA supplements HTML — it doesn't replace it.
- Every interactive element must be keyboard accessible.
- Every form control must have an associated label.
- Don't remove focus outlines unless replacing them with an accessible alternative.

## API & data fetching

- Use the native `fetch` API unless a project requirement justifies another HTTP client.
- Cache API responses with an appropriate strategy (for example `localStorage` with a TTL) when it improves performance and data freshness requirements permit.
- Debounce user-triggered API calls.

## Testing

- Vitest + Testing Library.
- Test behaviour, not implementation details.
- Co-locate test files next to the file under test: `src/components/Foo.test.tsx`, `src/services/foo.test.ts`.
- Name the file after what it tests: `<name>.test.ts` / `<name>.test.tsx` (use `.tsx` when the test renders JSX).
- `describe('given [conditions]')` for preconditions; `it('[behaviour]')` for the expected outcome.
- Group tests that share the same setup under one `describe`; open each group with `beforeEach(() => vi.clearAllMocks())`.
- No snapshot tests.
- Mock at the module boundary (`vi.mock('../services/...')`) for component tests; stub `fetch` directly for service-layer tests.

## Running the project

```bash
yarn dev          # dev server at http://localhost:5173
yarn build        # type-check + production build
yarn test:run     # run all tests once
yarn test         # watch mode
```
