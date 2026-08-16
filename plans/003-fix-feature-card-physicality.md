# 003 — Fix Feature Card Physicality

- **Status**: TODO
- **Commit**: HEAD
- **Severity**: MEDIUM
- **Category**: Physicality
- **Estimated scope**: 1 file, `FeaturesOverview.tsx`

## Problem

Feature cards move up excessively on hover (`-translate-y-2`), which feels disconnected and non-physical. 

```tsx
/* src/components/landing/FeaturesOverview.tsx:82 — current */
hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10
```

## Target

Cards should subtly scale up instead of translating Y, and use layered premium shadows.

```tsx
/* target */
hover:scale-[1.02] shadow-sm hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)]
```

## Repo conventions to follow
- Hover interactions should be bounded by `@media (hover: hover)` or done via Tailwind's `hover:` pseudo-classes that respect reduced motion safely.

## Steps
1. Open `src/components/landing/FeaturesOverview.tsx`.
2. Remove any `hover:-translate-y-x` logic from feature cards.
3. Apply `hover:scale-[1.02]` and `hover:shadow-premium-hover` (or exact rgba equivalents).

## Boundaries
- Do NOT touch the content arrays or icons.

## Verification
- **Mechanical**: App builds successfully.
- **Feel check**: Hovering over a card should feel like it's inflating/pressing up slightly, not teleporting vertically.
- **Done when**: Vertical jump is removed in favor of subtle scale.
