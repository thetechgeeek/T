# Design System Operations Checklist

> Companion to `docs/UI_Library_Checklist.md`.
> This file tracks external design-ops and asset-delivery workflows that support the design system but are not part of the pure in-repo library contract.
> Keep app-runtime concerns in `docs/UI_Integration_Checklist.md`.

## Design-to-Code Sync

### Common

- [ ] Figma token export pipeline (Tokens Studio / Style Dictionary / token transformer)
- [ ] Automated token sync from design tool to code repository
- [ ] Figma component annotations linked to implementation docs
- [ ] Figma review checklist includes hierarchy, accent budget, density mode, and fallback-state checks before implementation
- [ ] Design annotations call out hero/featured treatments vs standard operational treatments

### Web

- [ ] Figma frames linked to Storybook stories (Chromatic / Storybook Figma plugin)
- [ ] Visual diff between Figma design and live web implementation
- [ ] Visual diff baselines cover default, dense, empty, error, and no-media variants

### Mobile (React Native)

- [ ] Figma frames linked to native component examples
- [ ] Visual diff between Figma and rendered native components (simulator screenshots)
- [ ] Visual diff baselines cover default, dense, empty, error, and no-media variants

## Typography Asset Delivery

### Mobile (React Native)

- [ ] Custom font loading via `expo-font` or React Native asset linking
- [ ] Font weight mapping to platform-specific font files (iOS vs Android font naming)
