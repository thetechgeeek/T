# Design System Migrations

## 0.1.0

Use the EasyDesign package entrypoints instead of repo-local imports:

- `@/src/design-system` -> `@easydesign/design-system`
- `@/src/design-system/foundation` -> `@easydesign/design-system/foundation`
- `@/src/theme/*`, `@/src/hooks/useThemeTokens`, `@/src/hooks/useReducedMotion`, and related legacy UI helpers -> `@easydesign/design-system/foundation`

Deprecation policy:

- Repo-local compatibility paths are migration helpers only.
- Public package imports are the supported contract.
- Deprecated entrypoints keep an explicit migration note and a removal target of two minor releases unless a stronger compatibility need is documented.
