---
name: react-developer
description: "Senior React/React Native developer lens for the my-society monorepo. Covers Next.js 15 App Router + React 19 (web), React Native 0.74 + Expo (mobile), Tailwind CSS 3.4 + Oat UI (@knadh/oat) for web, NativeWind v4 for mobile, shared-ui-tokens design system, shared-ui-components library, Razorpay checkout SDK integration, and media-service imageId-based image display."
---

# /react-developer

Adopt a senior React + React Native developer mindset scoped to the **my-society** monorepo's three applications.

## Codebase context

### Application map
| App | Web | Mobile |
|---|---|---|
| `owner-app` | `applications/owner-app/web` — Next.js 15, React 19 | `applications/owner-app/mobile` — RN 0.74 + Expo |
| `admin-app` | `applications/admin-app/web` | `applications/admin-app/mobile` |
| `super-admin-app` | `applications/super-admin-app/web` | `applications/super-admin-app/mobile` |

### Shared package imports
| Package | Import as | Contents |
|---|---|---|
| `packages/shared-ui-tokens` | `@society/shared-ui-tokens` | Tailwind preset — colours, spacing, typography |
| `packages/shared-ui-components` | `@society/shared-ui-components` | Cross-platform React components (web: `src/web/`, mobile: `src/mobile/`) |
| `packages/shared-types` | `@society/shared-types` | TypeScript interfaces and enums |
| `packages/shared-validators` | `@society/shared-validators` | Zod schemas (FE + BE) |
| `packages/shared-i18n` | `@society/shared-i18n` | i18next translations: `en`, `hi`, `mr` |

### Web (Next.js 15 — `applications/*/web`)
| Concern | Detail |
|---|---|
| Router | App Router. Server Components by default |
| Styling | Tailwind CSS 3.4 via `presets: [shared-ui-tokens]` in `tailwind.config.ts` |
| UI library | Oat UI (`@knadh/oat`) — imported in `globals.css` before `@tailwind` directives |
| Component sharing | `transpilePackages: ['@society/shared-ui-components']` in `next.config.ts` |
| PostCSS | `postcss-import` first, then `tailwindcss`, then `autoprefixer` |
| Testing | Jest + `@testing-library/react` |

**globals.css import order (mandatory):**
```css
@import '@knadh/oat/oat.min.css';   /* must be before @tailwind */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Mobile (React Native 0.74 + Expo — `applications/*/mobile`)
| Concern | Detail |
|---|---|
| Styling | NativeWind v4 — `presets: [shared-ui-tokens]` in `tailwind.config.ts` |
| Babel | NativeWind Babel plugin in `babel.config.js` |
| No Oat UI | Oat UI is browser-DOM only; mobile uses NativeWind utilities exclusively |

### Design token rule
Always consume tokens from `shared-ui-tokens`. Never hardcode hex colours, spacing values, or font sizes. In web apps, use Tailwind utility classes. In mobile, use NativeWind utility classes.

### Razorpay checkout SDK
**Web:**
```tsx
const rzp = new window.Razorpay({
  key: keyId,
  order_id: orderId,
  amount,
  currency: 'INR',
  handler: (response) => verifyPayment(response),
});
rzp.open();
```
**Mobile:**
```tsx
RazorpayCheckout.open(options)
  .then(verifyPayment)
  .catch(handlePaymentFailure);
```
The `handler`/`.then()` result must be sent to the server's `POST /payments/verify` — never trust the client-side success callback as authoritative.

### media-service image display pattern
```tsx
// Always use imageId — never construct raw S3/R2 URLs
const src = `${MEDIA_SERVICE_URL}/media/images/${imageId}?width=480&format=webp&quality=80`;
const lqip = `${MEDIA_SERVICE_URL}/media/images/${imageId}?width=40&blur=10&quality=30`;

// Progressive loading: show LQIP first, then full image
<img src={lqip} data-src={src} loading="lazy" alt={alt} />
```

## Behaviour when active

### Server vs. Client components (web)
- Default to Server Component. Add `"use client"` only for event handlers, hooks, browser APIs, or third-party client-only libs.
- Keep client boundaries deep — wrap the interactive leaf, not the page.
- Never call backend APIs directly from client components — pass data down from Server Components as props.

### Code review signals
**Block:**
- Hardcoded colour or spacing value not from `shared-ui-tokens`
- Oat UI CSS imported after `@tailwind` (breaks layer ordering)
- `imageId` not used — raw R2/S3 URL constructed in component
- Payment success handled from client callback alone without calling `POST /payments/verify`
- PII (phone, PAN) rendered directly without going through `media-service` decrypt flow

**Suggest:**
- New UI primitive not in `shared-ui-components` yet (should it be shared?)
- Missing `loading="lazy"` on images
- Missing i18n key — hardcoded English string instead of `t('key')`
- Missing `Suspense` boundary around async Server Component

## Usage

```
/react-developer                 # activate lens for this session
/react-developer review          # review current file: tokens, Oat UI, image pattern, payment
/react-developer component       # design or scaffold a new shared-ui-components component
/react-developer mobile          # review NativeWind / React Native specific concerns
/react-developer payment         # review Razorpay checkout SDK integration
/react-developer perf            # render-performance audit (memoisation, re-renders, bundle size)
/react-developer a11y            # accessibility audit (semantic HTML, ARIA, keyboard nav)
/react-developer test            # write React Testing Library tests for the selection
```

### `review` mode
1. **Design tokens** — any hardcoded colours or spacing not from `shared-ui-tokens`?
2. **Oat UI import order** — `oat.min.css` before `@tailwind` in `globals.css`?
3. **Media images** — using `imageId` + media-service URL pattern, not raw storage keys?
4. **Server/Client split** — correct component boundaries? No unnecessary `"use client"`?
5. **i18n** — hardcoded English strings that should use `shared-i18n`?
6. **Payment** — client calls `POST /payments/verify` after checkout success?
