# 001 — Update Global Color Tokens (Stripe-inspired)

- **Status**: TODO
- **Commit**: HEAD
- **Severity**: HIGH
- **Category**: Cohesion & Tokens
- **Estimated scope**: 1 file, `globals.css`

## Problem

The landing page uses generic blue colors (`#003d9b`), which doesn't reflect a premium enterprise medical SaaS feeling. The cohesion of the brand feels standard, missing an opportunity to leverage beauty.

```css
/* src/app/globals.css:14 — current */
  --color-primary: #003d9b;
  --color-primary-container: #0052cc;
```

## Target

A vibrant Stripe-inspired "Tech Medical" color palette (Indigo/Cyan).

```css
/* target */
  --color-primary: #4f46e5;
  --color-primary-container: #4338ca;
  --color-secondary: #06b6d4;
  --color-secondary-container: #0891b2;
```

## Repo conventions to follow
- Base variables live in `src/app/globals.css` under the `@theme inline` block.

## Steps

1. Edit `src/app/globals.css` to replace all `--color-primary` and `--color-secondary` hex codes with the new Indigo and Cyan values.
2. Ensure the background color maps to `--color-background: #ffffff;` for absolute purity.

## Boundaries
- Do NOT touch layout logic.
- Do NOT add new dependencies.  (Hello akjdfd)

## Verification
- **Mechanical**: `npm run build` passes.
- **Feel check**: Visit `http://localhost:3000/`. The primary buttons and glows should now reflect a premium Indigo/Tech Medical theme instead of generic deep blue.
- **Done when**: All primary accents visually reflect `#4f46e5`.
