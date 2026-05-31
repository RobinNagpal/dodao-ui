---
name: koalagains-ui-code-verify
description: Verify insights-ui (KoalaGains) UI code against the leaf-component-system structure and guidelines. Use when reviewing or before pushing UI changes under insights-ui/src (new/edited components, pages, or leaf components) to confirm Tailwind lives only in the leaf layer, leaves follow the cva + cn authoring pattern, and formatting/lint expectations are met. Triggers: "verify the UI code", "check this against the leaf guidelines", "is this component style-free", "did I follow the leaf-component rules".
---

# KoalaGains UI Code Verify

Verify that UI code in `insights-ui` conforms to the **leaf-component system** — the
architecture where a small set of leaf components own ALL Tailwind, and every
high-level component (admin pages, stock/ETF page components, scenario pages)
contains ZERO Tailwind.

The source-of-truth for the rules is
[`docs/insights-ui/ui-leaf-component-system.md`](../../../docs/insights-ui/ui-leaf-component-system.md).
The backlog of follow-ups is
[`docs/insights-ui/next-ui-cleanups.md`](../../../docs/insights-ui/next-ui-cleanups.md).
Read the architecture doc first if anything below is ambiguous — it wins over this summary.

## When to run

Run this verification when:
- A new component or page was added/edited under `insights-ui/src/**`.
- A new leaf was added under `insights-ui/src/components/ui/**`.
- Before pushing any insights-ui UI change, or when asked to review one.

## Scope of files

- **Leaf layer (Tailwind allowed):** `insights-ui/src/components/ui/**`
- **High-level components (must be style-free):** everything else under
  `insights-ui/src/app/**` and `insights-ui/src/components/**`.

Determine which set each changed file belongs to before applying checks — the
rules differ between the two.

## Verification checklist

Work through every changed UI file. Report findings as a checklist with
file:line references and a concrete fix for each violation.

### A. High-level components (NOT under `components/ui/**`)

1. **Zero `className`.** There must be no `className` JSX attribute and no inline
   Tailwind utility strings. Each one is a violation — map it to the leaf concern
   it should use instead:
   - layout/spacing → `Stack`, `MetricGrid`
   - surfaces → `CardSection`, `InlineCard`, `card`
   - text → `Heading`, `Text`
   - badges/feedback → `StatusBadge`, `PassFailBadge`, `ScenarioOutlookBadge`,
     `AppliedFilterChip`, `MetricCell`, `EmptyStateCard`
   If a needed leaf/variant does not exist, the fix is to add it to the leaf
   layer first (not to inline Tailwind here).
2. **No `style={{…}}` for things a leaf/token should own** (spacing, color,
   typography). Dynamic, data-driven inline styles (e.g. a computed width %) are
   acceptable only when no token/leaf can express them — flag for confirmation.
3. **Composition reads as structure**, not utility soup. The component should be
   leaves composed together.

### B. Leaf components (under `components/ui/**`)

1. **`cva` + `cn` authoring pattern.** Variants are defined with `cva`; the final
   className is `cn(variant({...}), className)` so a caller-supplied `className`
   merges last. Do NOT introduce `tailwind-variants` — `cva` is the standard.
2. **Full literal class strings only.** Variant maps contain complete class
   strings (`'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'`). NEVER interpolate
   (`` `grid-cols-${n}` ``, `` `bg-${color}-900` ``) — Tailwind's content scanner
   purges classes it can't see literally. This is the highest-severity leaf bug.
3. **Constrained, semantic prop vocabulary.** Spacing is a scale
   (`gap="sm"|"md"`), color is a `tone`/`sentiment`/`variant` — not raw Tailwind
   passed through. Callers should not be able to inject arbitrary utilities.
4. **Accepts `className?`** and merges it last via `cn()`.
5. **Prefer semantic tokens** (`bg-block`, `text-body`, `text-primary`, …, wired
   in `tailwind.config.ts` / `src/util/theme-colors.ts`) over ad-hoc `bg-gray-*`.
   Existing ad-hoc grays are acceptable but note them as token-adoption candidates.
6. **Reuse before creating.** A new leaf must not duplicate an existing leaf or a
   web-core primitive. Grep `components/ui/**` and
   `shared/web-core/src/components/core/**` first. Do NOT edit web-core for
   insights-ui styling — wrap it from the leaf layer.
7. **Inventory updated.** A genuinely new leaf should be added to the inventory
   table in `ui-leaf-component-system.md`.

### C. Tooling (run what the environment allows)

Run from `insights-ui/`:

1. **Prettier (standalone — always runnable):**
   ```bash
   npx --yes prettier@2.8.8 --check 'src/**/*.{js,ts,tsx,json}'
   ```
   This is the same glob CI uses. Fix with `--write` and re-check.
2. **ESLint / type-check:** `yarn lint`, `yarn compile`. These need the full
   workspace install (the `@dodao/web-core` workspace package + TypeScript). If
   deps can't be installed locally (`next lint` fails fetching `@dodao/web-core`),
   say so explicitly and treat **CI (GitHub Actions / Vercel) as authoritative**
   for lint + type-check — do not claim they passed if you didn't run them.
3. The `className` guardrail is `no-restricted-syntax` configured in BOTH
   `.eslintrc.json` (active under ESLint 8) and `eslint.config.mjs`. It is `warn`,
   so it won't fail the build today — manual review per section A is still required.

## How to report

Produce a concise report:
- **PASS / FAIL** per changed file (or grouped).
- For each violation: `file:line`, which rule (A/B/C + number), and the concrete fix.
- State explicitly which tools you actually ran vs. which were deferred to CI —
  never imply a check passed if it didn't run.
- If a fix requires a new leaf or an architectural decision (e.g. a header/container
  pattern that diverges across sites — see the deferred list in
  `next-ui-cleanups.md`), surface it and ask before forcing consolidation.

## Don't

- Don't edit `shared/web-core/**` for insights-ui styling work.
- Don't move Tailwind "up" into a high-level component to make a check pass.
- Don't introduce interpolated Tailwind class names anywhere.
- Don't report a clean lint/type-check unless you actually ran it successfully.
