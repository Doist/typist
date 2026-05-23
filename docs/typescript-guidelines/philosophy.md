# TypeScript Philosophy

## Core Principles

- **Strict types, zero `any`** - The type system is your first line of defense. Never use `any`; use `unknown` when the type is genuinely not known.
- **Minimal and simple** - Prefer the simplest solution that works. Three similar lines are better than a premature abstraction.
- **Self-documenting** - Precise naming and strong types replace most comments. Code should read like prose.
- **Fix errors, don't suppress** - Fix linter and type errors at the root. Never `@ts-ignore`; use `@ts-expect-error` with explanation only when truly unavoidable.
- **Performance-conscious** - Memoize expensive computations, avoid unnecessary recomputation, virtualize long lists.
- **Accessible by default** - Semantic HTML, ARIA attributes, keyboard navigation, and sufficient contrast in every interface.

## What This Means

- A new developer can understand any component by reading its types and props
- Type errors caught at compile time never reach users
- Refactoring is safe because the compiler catches breakage
- Code reviews focus on logic and architecture, not formatting or type correctness
