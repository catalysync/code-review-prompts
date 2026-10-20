# code-review-prompts

A library of code-review prompts, layered by language and framework. Drop them into Claude Code, Codex, PR-Agent, or any LLM-based reviewer.

The premise: every useful code review is three layers of rules.

| Layer | What | Example | Where it lives |
|-------|------|---------|----------------|
| 1 — universal | Role, diff format, evidence, tags, calibration, output schema, tone | "Every finding cites `path:line` and the code that proves it. Better empty than padded." | `_base/universal.md` |
| 2 — stack | Language and framework idioms | "FastAPI login routes need an equivalent-cost dummy hash on the no-user path." | `python/+fastapi.md` |
| 3 — project | What failure looks like in your repo, deliberate choices, paths to skip | "We use HTTPBearer not OAuth2PasswordBearer. Don't suggest the swap." | Your repo's `REVIEW.md` |

This repo ships layers 1 and 2. Layer 3 is yours to write — and the [`code-review`](https://github.com/catalysync/code-review) harness composes all three at runtime.

## Stacks

| Stack | Base | Frameworks |
|-------|------|------------|
| Python | `python/base.md` | `+fastapi.md` |
| TypeScript | `typescript/base.md` | `+react.md`, `+nextjs.md` |
| JavaScript | `javascript/base.md` | (use `typescript/+react.md` for JS+React via JSX) |
| Ruby | `ruby/base.md` | `+rails.md` |
| Go | `go/base.md` | — |
| Rust | `rust/base.md` | — |
| C | `c/base.md` | — |

Each file declares its `extends:` chain in YAML frontmatter. A composer reads the leaf file, resolves the chain, and concatenates parents → child. The leaf wins on conflicts.

## Use it directly

Pick the leaf you want and concatenate:

```bash
cat \
  _base/universal.md \
  python/base.md \
  python/+fastapi.md \
  > my-prompt.md
```

Drop the result into the system prompt of your reviewer.

## Use it with the harness

The companion [`code-review`](https://github.com/catalysync/code-review) tool resolves layers automatically, supports project-level overrides, and posts inline GitHub comments with `suggestion` blocks.

```bash
npx @catalysync/code-review init     # detect stack, generate config
npx @catalysync/code-review pr 42    # review PR #42 in the current repo
```

## Add your project rules

Create a short `REVIEW.md` at your repo root (the format Anthropic's Claude Code team describes in "How the Claude Code team does code review"):

```markdown
# Review rules

## What failure looks like here
Money is computed wrong or a royalty is paid twice. Flag anything that can change an amount.

## Not bugs — don't flag
- We deliberately use `HTTPBearer(auto_error=False)` to control the error envelope.

## Rules
- At most 3 nits per review.
- Every finding cites `path:line` and quotes the code. No guesses from names.
- Start the summary with the count; say "No issues found." when there's nothing.

## Skip
- `db/schema.rb`
- `vendor/`
```

Keep it short; move a recurring review comment into it instead of re-arguing it on every PR. The harness also still reads the older `.review/project.md`. `code-review init` scaffolds a `REVIEW.md` template.

## What the universal layer asks of the model

- **Evidence**: `path:line` plus the quoted code for every finding. No invented columns, methods or files.
- **Tags**: `Important` (problem in changed code), `Nit` (capped at 3), `Pre-existing` (real, but in code the PR didn't touch; never blocks).
- **Class of bug**: report a repeated mistake once and list every location.
- **Summary**: starts with a count; plainly "No issues found." when clean.
- **Calibration**: an issue-count table by PR size, so the model doesn't pad.
- Output via a `submit_review` tool call (or the YAML schema as a fallback). The model never posts anything itself.

## Contributing a stack

1. Fork.
2. Add `<stack>/base.md` with the universal `extends: [_base/universal]`.
3. Optional: add `<stack>/+framework.md` with `extends: [<stack>/base]`.
4. Cite your sources (existing linters, official guides, community style guides).
5. Open a PR. Tests under `test/` validate the frontmatter and the chain.

## Sources we draw from

- **PR-Agent** (`qodo-ai/pr-agent`, BSD-3-Clause) — universal prompt structure, calibration tables.
- **CodeRabbit** docs — path-aware extension model.
- **tiangolo/full-stack-fastapi-template** — FastAPI conventions.
- **eslint-plugin-react**, **eslint-plugin-react-hooks**, **eslint-plugin-next** — React/Next idioms.
- **clippy** — Rust lints.
- **gosec**, **staticcheck** — Go.
- **bandit**, **ruff** — Python.
- **brakeman**, **rubocop-rails** — Ruby on Rails.
- **CERT-C**, **MISRA-C** — C safety.
- **OWASP** Top 10, REST Security Cheat Sheet.

## License

MIT.
