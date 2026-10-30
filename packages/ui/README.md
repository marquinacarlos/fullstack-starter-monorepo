# @repo/ui

Small shared component set: `Button` (primary | secondary | ghost), `Input`, `Card`, `CardHeader`, `CardContent`.

Components only use token classes from `@repo/tailwind-config` (`bg-primary`, `border-border`, ...).
Every app that uses them must scan this folder:

```css
@source "../../../packages/ui/src";
```
