# UI Shell Migrations

## 0.1.0

Use the EasyDesign shell package entrypoint instead of repo-local imports:

- `@/src/ui-shell` -> `@easydesign/ui-shell`
- Private paths such as `@/src/ui-shell/components/...` or `@easydesign/ui-shell/components/...` are not supported consumer entrypoints.

Consumer app migration guidance:

- Move root provider wiring to `ShellRootProviders`.
- Move auth redirect logic to `ShellAuthGate`.
- Pass runtime and product integrations through shell adapters instead of importing app stores into the shell.

Deprecation policy:

- Consumer-facing shell API changes must ship with CHANGELOG updates, migration notes, and an explicit removal target.
- Deprecated shell APIs remain documented for at least two minor releases unless a security or runtime issue requires a faster removal.
