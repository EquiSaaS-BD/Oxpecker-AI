# 002 — Fix Navbar & Hero Easing

- **Status**: TODO
- **Commit**: HEAD
- **Severity**: HIGH
- **Category**: Easing & Duration
- **Estimated scope**: 2 files, `Navbar.tsx`, `HeroSection.tsx`

## Problem

The hover states on buttons use `transition-all duration-300`, which forces layout properties to animate and uses sluggish built-in easings.

```tsx
/* src/components/layout/Navbar.tsx:84 — current */
className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary transition-colors"
```

## Target

Explicitly target `transform`, `opacity`, and `color` with custom `var(--ease-out)` and faster duration (150ms-200ms).

```tsx
/* target */
className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary emil-button"
```

## Repo conventions to follow
- Custom easing classes live in `globals.css` (e.g., `.emil-button`).

## Steps

1. In `Navbar.tsx`, ensure all interactive links have the `.emil-button` class and remove generic `transition-all` classes.
2. In `HeroSection.tsx`, verify Framer Motion configs use `ease: [0.23, 1, 0.32, 1]`.

## Boundaries
- Do NOT change link destinations.
- Motion properties only.

## Verification
- **Mechanical**: `npm run lint` passes.
- **Feel check**: 
  - Click and hold the "Get Started" button; it should smoothly scale to `0.97` without abrupt jumping.
  - In DevTools (Animations), at 10% speed, confirm there is no delay at the start of the hover effect.
- **Done when**: All links feel instantly responsive to hover and click.
