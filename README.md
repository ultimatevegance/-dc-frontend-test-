# DC — What Technologies We Use

A search box that lets you explore the tools and technologies used at DC Asia. Built as part of the DC frontend interview test.

---

## Quick start

**Requires Node 18+ and [pnpm](https://pnpm.io).**

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Type-check + production build |
| `pnpm preview` | Preview the production build |
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Re-run tests on file save |
| `pnpm test:coverage` | Tests with coverage report |
| `pnpm deploy:push-only` | Push to GitHub (CI handles the rest) |

---

## Tech stack

| | |
|---|---|
| **Framework** | Vue 3 — Composition API + `<script setup>` |
| **Language** | TypeScript |
| **Build tool** | Vite 6 |
| **Styles** | Tailwind CSS v4 |
| **Tests** | Vitest + @vue/test-utils |

---

## Features

- **5 search states** — idle, loading, success, empty, error
- **Debounced input** (300 ms) — avoids hammering the API on every keystroke
- **Request cancellation** — in-flight requests are aborted when a new query starts
- **8 s hard timeout** — slow responses are automatically cancelled
- **Keyboard navigation** — `↓` into results, `↑/↓` between items, `↑` back to input, `Escape` to clear
- **Quick-filter tags** — click to search a category; click again to clear
- **Accessible** — ARIA roles, live regions, visible focus rings
- **Smooth transitions** — height animates via `ResizeObserver`; state changes and result items fade in

---

## Project structure

```
src/
  components/
    icons/              SVG icon components (Search, Spinner, Tag, ExternalLink, DC)
    illustrations/      SVG illustration components (Empty, Error states)
    SearchBar/          Input — icon + border colour driven by status
    Tag/                Pill chip — active/inactive, click-to-search
    ResultItem/         Result row — logo, title, description, external link
    SearchBox/          Card container — orchestrates state, keyboard nav, height animation
                        SearchFooter.vue — status text below the results list
  composables/
    useSearch.ts        Debounced search, status machine, request lifecycle
  utils/
    api.ts              Fetch wrapper with timeout + AbortController
  types/
    index.ts            SearchResult, SearchStatus
  style.css             Tailwind v4 @theme tokens + Vue transition classes
```

---

## CI / CD

Every push runs the full pipeline via GitHub Actions (`.github/workflows/ci-cd.yml`):

```
Push to main          →  type-check → test → build → deploy to GitHub Pages
Pull request to main  →  type-check → test → build
```

Live URL after first deploy:
```
https://<your-github-username>.github.io/dc-frontend-test/
```

**One-time setup** — enable GitHub Pages in the repo:
> Settings → Pages → Source → **GitHub Actions**

---

## Simulating the error state

In `src/utils/api.ts`, flip the toggle at the top of the file:

```ts
// Set to false to simulate API throttling / timeout errors
const NO_THROTTLING = false
```

Any search will now trigger the error state. Set it back to `true` to restore normal behaviour.

---

## My thinking process

### Component decomposition

Each component owns exactly one responsibility:

- **`SearchBar`** — purely presentational. Receives `status` and reflects it as a border colour; the parent owns the value.
- **`Tag`** — a stateless pill that fires a `click` event. Active state is computed in `SearchBox` so a tag can never get out of sync with the query.
- **`ResultItem`** — a semantic `<a>` element. Opening a result is native link behaviour — no JS needed for the click, only keyboard nav events.
- **`SearchFooter`** — isolated footer so `SearchBox` stays focused on layout and interaction.

### State management

I used a **composable** (`useSearch`) instead of Pinia. The state is local to a single feature; a global store would be over-engineering. The composable returns reactive refs that `SearchBox` binds to its children directly.

The `SearchStatus` union (`idle | loading | success | empty | error`) makes every state explicit at the type level — if a new state is added, TypeScript flags every unhandled location.

### Debounce and cancellation

A 300 ms debounce reduces API traffic while typing. Every search creates a **new `AbortController`** and cancels the previous one, so a slow response that arrives after the user has typed something new is silently discarded. A hard 8 s timeout via `AbortSignal.timeout` ensures no request hangs indefinitely.

### Height animation

CSS cannot animate `height: auto`. Instead, a `ResizeObserver` watches the inner content element and syncs the outer wrapper's explicit height whenever content changes. A CSS `transition` on the wrapper then interpolates between the two values — no JS timers, no `scrollHeight` polling, no Vue transition hooks needed.

### Tailwind v4

Tailwind v4 ships as a Vite plugin — no PostCSS config needed. Custom design tokens (`--color-brand`, `--color-error`, `--color-surface`) are declared once in `src/style.css` under `@theme { … }` and become first-class utilities (`bg-brand`, `text-error`, `bg-surface`).

### Testing strategy

- **`useSearch`** — tested in isolation with fake timers and a mocked API. Covers all status transitions, debounce timing, AbortError handling, and clearSearch.
- **Components** — tested with `@vue/test-utils`. Each component is tested against its own contract (props in → rendered output / emitted events out).
- **`SearchBox`** — the composable is mocked so UI states can be controlled directly, keeping these tests focused on rendering and interaction rather than async logic.
