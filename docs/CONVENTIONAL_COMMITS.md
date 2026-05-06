# Conventional Commits

Status: required for local commits and release notes.

Commit subjects must use:

```text
type(optional-scope): lowercase summary
```

Allowed types are `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`,
`style`, and `test`. Breaking changes use `!` before the colon.

Examples:

```text
fix(payments): normalize receipt failures
ci: add product surface truthfulness check
feat(inventory): export CSV without SheetJS
```

`npm run commitlint -- --message "fix: example"` validates a subject without creating a commit.
Husky runs the same check from `.husky/commit-msg`.
