# DC Frontend Test — Claude Code Context

## Project

Search box component for DC Asia's frontend interview test.
API: `https://frontend-test-api.digitalcreative.cn/?no-throttling=true&search=<query>`

## Stack

| Tool | Version | Why |
|---|---|---|
| Vue 3 | `^3.5` | DC's preferred framework |
| TypeScript | `^5.7` | Type safety, bonus requirement |
| Vite | `^6` | Fast DX, modern build tool |
| Tailwind CSS | `^4` | DC uses Tailwind; v4 uses CSS-based config |
| Vitest | `^4` | Vite-native test runner |
| @vue/test-utils | `^2` | Official Vue component testing library |

## Dev commands

```bash
pnpm dev              # dev server → localhost:5173
pnpm build            # type-check + production build
pnpm test             # run all 61 tests once
pnpm test:watch       # re-run on file save
pnpm test:coverage    # tests + coverage report
pnpm deploy:push-only # push code to GitHub (CI deploys Pages)
```

## Project structure

```
src/
  components/
    SearchBar/          SearchBar.vue — input, icon, border by status, exposes focus()
    Tag/                Tag.vue — pill chip, active/inactive
    ResultItem/         ResultItem.vue — logo, title, desc, external link
    SearchBox/          SearchBox.vue — card container, keyboard nav, all states
                        EmptyIllustration.vue — SVG for empty state
                        ErrorIllustration.vue — SVG for error state
  composables/
    useSearch.ts        Debounced search (300 ms), AbortController, status machine
  utils/
    api.ts              Fetch wrapper; honours VITE_NO_THROTTLING env var
  types/
    index.ts            SearchResult, SearchStatus
  style.css             Tailwind v4 @import + @theme tokens + Vue transitions
  vite-env.d.ts         Vite env type augmentation
  __tests__/
    setup.ts            Global afterEach mock cleanup
    utils/              api.spec.ts
    composables/        useSearch.spec.ts
    components/         SearchBar, Tag, ResultItem, SearchBox specs
```

## Key design decisions

- **Composable over Pinia** — state is local to one feature; no store needed.
- **`SearchStatus` union** — `idle | loading | success | empty | error` — exhaustive, type-safe state machine.
- **AbortController + debounce** — cancels stale requests; `AbortSignal.any` combines caller signal with 8 s timeout.
- **`QUICK_TAGS` as `string[]`** — tags use the same value for display and query, so no wrapper type is needed.
- **Illustrations extracted** — `EmptyIllustration.vue` and `ErrorIllustration.vue` keep `SearchBox.vue` scannable.
- **Tailwind v4 `@theme`** — brand tokens (`--color-brand`, `--color-error`, `--color-surface`) defined once in CSS, used as utilities everywhere.

## Environment variables

| Variable | Default | Effect |
|---|---|---|
| `VITE_NO_THROTTLING` | `true` | Set `false` to simulate API timeout/error |

## Tailwind v4 notes

- No `tailwind.config.js` — all config in `src/style.css` under `@theme { … }`.
- `@tailwindcss/vite` plugin in `vite.config.ts` — no PostCSS needed.
- Custom utilities available: `bg-brand`, `text-brand`, `text-error`, `bg-error-light`, `bg-surface`.

## CI/CD

GitHub Actions workflow at `.github/workflows/ci-cd.yml`:
- **All branches / PRs**: type-check → test → build
- **`main` only**: + deploy to GitHub Pages

One-time setup: repo Settings → Pages → Source → **GitHub Actions**.
