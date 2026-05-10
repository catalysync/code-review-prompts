# Contributing

## Adding a stack

1. Pick a stack name (lowercase, hyphenated): `python`, `typescript`, `ruby`, `go`, `rust`, `c`, `kotlin`, `swift`, `csharp`, `php`, `elixir`, etc.
2. Create `<stack>/base.md` with frontmatter:
   ```yaml
   ---
   id: <stack>
   description: <one line — what the stack covers and where the rules come from>
   extends: [_base/universal]
   ---
   ```
3. Sections to fill (none mandatory, all helpful):
   - Language gotchas — version-specific, syntax pitfalls.
   - Errors — what's a real bug, what's swallowed silently.
   - Async — concurrency primitives and their failure modes.
   - Security — top issues from the stack's standard scanners.
   - Performance — common O(n²) and N+1 patterns.
   - Conventions — only those that catch real bugs (not style).
4. Cite your sources. Every check should be traceable to a linter rule, official guide, or well-known idiom.

## Adding a framework overlay

1. Create `<stack>/+<framework>.md` with frontmatter:
   ```yaml
   ---
   id: <stack>.<framework>
   description: <one line>
   extends: [<stack>/base]
   ---
   ```
2. Only include rules that are framework-specific. Anything language-level belongs in `<stack>/base.md`.

## Style for the prompt content itself

- Direct. Imperative. "Flag X." not "Consider whether X might be flaggable."
- Always include the **trigger** (what the code does), the **impact** (why it matters), the **fix** (what to do).
- Examples are diff snippets when useful, not flowing prose.
- Ban rules that catch style only — every rule must catch a real bug class or a real security/performance issue.
- Minimum bar for inclusion: a check that, when applied to a real PR, would have caught a real bug at least once. Hypothetical "bad-looking code" rules don't ship.

## Tests

`test/` validates:

- Every `.md` file has valid frontmatter.
- Every `extends` chain resolves.
- No circular `extends`.
- Every rule mentions either "flag" or "block" (i.e., is actionable, not narrative).

Run: `pnpm test` (after `pnpm install`).

## License

By contributing, you agree your contribution is licensed under MIT.
