---
name: code-cleanup
description: >-
  Rigorously audit a codebase against elite, production-grade engineering standards and then clean it
  up — fix folder structure and file placement, architecture, layering, duplication, hardcoding, types,
  performance, and dead code until the result is code a senior engineer at a top-tier product team would
  be proud to ship. Use this whenever the user asks to review, audit, clean up, refactor, tighten, harden,
  or "bring to standard" any code, file, component, page, module, or an entire project — or asks whether
  code is production-quality, well architected, optimized, maintainable, or "good." Also use it for
  structure and placement work: "restructure the src folder," "this is a mess / I don't know what I'm
  looking at," "where should this file live," "these files are out of place," "split this up," "get rid of
  features/," or moving components/services/hooks/types into their proper home. Trigger even when the user
  just says "clean this up," "is this good code?," "make this production-ready," "go through the codebase,"
  or "make this senior-level" without naming the skill. Default scope is the ENTIRE project; honor a
  narrower scope only if the user names a specific path, folder, feature, or file.
---

# Code Cleanup

Audit code against an elite production bar, then clean it up. The target is not "it works" — it is code
that a senior engineer at a top-tier product team (the kind of code that ships in a mature Google / AWS /
Airbnb product) would look at and find genuinely excellent: correct, well-architected, ruthlessly modular
but not fragmented, dense but readable, and actually fast. Almost every real codebase has issues. Your job
is to find them with evidence and fix them without breaking anything or churning code that is already good.

Two things define "excellent" here and they are in tension — hold both:

- **Small.** Why write 100 lines when 10 correct lines do it? Why a 2,000-line file when a well-factored
  200 does it better? Terseness comes from good factoring and reuse, never from cleverness or code golf.
- **Fast.** Condensed is not the same as optimized. Short code can still do redundant work, have quadratic
  complexity, and cause render lag. Optimize the hot paths for real; keep the cold paths simple.

If a change makes the code longer, slower, harder to follow, or more fragmented, it is not a cleanup — it is
damage. Prefer the boring, correct, obvious solution.

---

## Invocation & scope

Before doing anything, resolve two things and state them back in one line:

1. **Scope.** Default is the **entire project**. If the user named a path, folder, feature, file, or
   surface (e.g. "run this on `src/web/cards`" or "clean up the dashboard page"), restrict to that — plus
   the direct dependencies it touches, read-only, for context. Never silently widen or narrow scope.
2. **Mode.** Default is **audit + fix**: audit the scope, report, then remediate. If the user says "audit
   only," "just report," "don't change anything yet," or similar, stop after the report.

Then read the project's own rules **first** and treat them as authoritative for project-specific
conventions: `CLAUDE.md`, any house-style / engineering-rules doc, `package.json` scripts, and the relevant
`docs/` (architecture, build-plan). This skill supplies the *rigor and method*; the repo supplies the
*specific conventions and commands*. Where they conflict, the repo wins — but the standards below are the
floor, so if the repo is silent on something, apply them.

---

## The prime directive: pages compose, components display

This is the single most important architectural rule and the one most often violated.

**A page/route/screen orchestrates. It never displays.** Its entire job is to assemble already-existing
components and feed them data. It must not contain presentational markup beyond layout composition, must
not hold business logic, and must not fetch its own data. Every visible thing is a component. Data comes
from a hook/service, not from the page.

```tsx
// BAD — page displays, fetches, formats, and holds logic. This is how god-files start.
export default function DashboardPage() {
  const [rows, setRows] = useState([]);
  useEffect(() => { fetch("/api/github").then(r => r.json()).then(setRows); }, []);
  const open = rows.filter(r => r.state === "open").sort((a,b) => b.updated - a.updated);
  return (
    <div className="grid">
      <h1 style={{ fontSize: 24 }}>GitHub</h1>
      {open.map(r => <div key={r.id} className="card">{r.title} · {new Date(r.updated).toLocaleString()}</div>)}
      {/* ...400 more lines of inline markup... */}
    </div>
  );
}

// GOOD — page composes. Data behind a hook, display behind a component, formatting in a helper.
export default function DashboardPage() {
  const github = useGithubCard();          // data + loading/error state
  return (
    <DashboardGrid>
      <GithubCard {...github} />            // component renders; page never touches markup
    </DashboardGrid>
  );
}
```

If you find a page rendering domain markup, fetching data, or holding logic, that is a **P1** finding:
extract the markup into components, the data into a hook/service, the transforms into pure helpers, and
reduce the page to composition.

---

## Workflow

### Phase 0 — Resolve scope & read the rules
As above. Confirm scope + mode in one line, load the repo's conventions and its gate commands from
`package.json`.

### Phase 1 — Map the code (cheap, broad)
Build a model of the structure before judging any file. Use fast signals first:
- **`find src -type d | sort` and read the whole tree.** Then run the repo's structure gate
  (`npm run guardrails`). Layout drift is rubric category 0 and it is invisible if you only ever open
  files the user named — it only shows up when you look at the directory listing as a whole.
- Directory tree, entry points, the component library, services/connectors, shared `lib`/`hooks`, types.
- Line counts to spot god-files: `find <scope> -name '*.ts*' | xargs wc -l | sort -rn | head -40`.
- Duplication, `any` usage, dead code, hardcoded values: `rg -n "\bany\b|TODO|FIXME|fetch\(|localhost|http://|hard.?code" <scope>` and similar. Grep is for locating suspects; you still read them.
- Dependency direction (does shared code import feature code? do components import services directly?).
- The perf surfaces: big lists, heavy renders, tight loops, data flows, anything the user would call "laggy."

### Phase 2 — Audit against the rubric
Go **module by module** (feature by feature), and within each walk every rubric category below. Every
finding must be concrete and evidence-based: `path:line`, what is wrong, *why it matters*, and the specific
fix. No vague "improve quality." If you cannot point to a line and name the better pattern, it is not a
finding.

### Phase 3 — Report
Emit the report using the exact template below. Lead with a one-screen scorecard so the user gets the shape
instantly, then findings by severity, then a prioritized plan.

### Phase 4 — Remediate (unless audit-only)
Fix in priority order (P0 → P1 → P2 → P3), in **reviewable units**, keeping the build green throughout.
Every change follows the 3-pass rule and the remediation rules below. Refactors are behavior-preserving;
the only behavior changes are explicit bug fixes, and you call those out. For a whole-project scope, work
incrementally and checkpoint — never one giant diff.

**Do layout first (rubric 0), as its own unit**, before any content-level fix. Moving files after you have
rewritten their insides doubles the review burden and makes a bad move hard to spot. Follow
*Fixing layout findings — the migration procedure* below; it is one operation, verified end to end, not a
drip of individual moves.

### Phase 5 — Verify & finish
Run the gates, report exact results, and close with the finish checklist. Never say "done" on a failing
gate.

---

## The audit rubric

Score each category **Pass / Needs work / Fail** in the scorecard, and log specific findings.

### 0. Layout & file placement — *where things physically live*
Audit this **first**, and audit it against the tree, not against vibes. Layering (category 1) is about
which module imports which; this is about whether a reader can find a file at all. A codebase can have
perfect import direction and still be unnavigable because the same *kind* of thing lives in six places.

Run `npm run guardrails` before reading any file — `validate-structure` and `validate-layer-boundaries`
encode the contract mechanically and will point at drift in a second. Then verify by eye:

```
src/
  components/<domain>/<Name>/index.tsx   EVERY component in the app, no exceptions
  pages/<route path>/index.tsx           thin route binding (params in, screen out)
  pages/<route path>/<Name>Screen.tsx    that route's screen + its .scss
  services/<name>Service.ts              every backend request and persisted store
  shared/types|utils|hooks|styles|config ONLY these five; no components, no services
  router/                                route table (routes.ts) + navigation (index.ts)
  assets/
```

**This tree is the default target.** If the repo's own docs specify a different layout, the repo wins
(Phase 0) — but if the repo is silent, or if what you find is "a bit of everything everywhere," this is
what you restructure *toward*. Don't invent a third layout, and don't leave misplaced files where they
are because moving them feels out of scope: placement is the finding.

**Where does this file go?** Every file answers one question, and each answer has exactly one home:

| The file is… | It goes to |
|---|---|
| A component rendered by more than its own screen | `components/<domain>/<Name>/index.tsx` |
| The top-level UI for one route | `pages/<route>/<Name>Screen.tsx` |
| The route binding (reads params, renders the screen) | `pages/<route>/index.tsx` |
| An HTTP call, or a store that persists across screens | `services/<name>Service.ts` |
| React state/effects orchestrating a screen's data | `shared/hooks/use<Thing>.ts` |
| A request/response DTO or a domain type | `shared/types/<domain>.ts` |
| Pure logic — adapters, formatting, maths, parsing | `shared/utils/<domain>/<name>.ts` |
| A route path, alias, or navigation helper | `router/` |
| Static data a component happens to sit next to (icon tables, presets) | `shared/utils/` — it is data, not UI |

Sub-components used by exactly one screen still go in `components/<domain>/` — "only used once" is not a
reason to leave a component in a page folder, because the next reader still has to find it.

Imports point **downward only**. Check direction as well as placement:

| Layer | may import |
|---|---|
| `pages` | components, services, shared, router |
| `components` | components, shared, router |
| `services` | services, shared, router |
| `shared/hooks` | services, shared, router |
| `shared/{types,utils,styles,config}` | shared only |
| `router` | shared only |

An upward import is usually a *placement* bug wearing a layering costume: data sitting inside a
component, or a UI type declared on the component that renders it. Move the thing down, don't add an
exception.

Findings to raise as **P0**, because each one is how the tree rots:
- A `features/` folder, or any layout where one feature owns its own `components/`, `services/`, `hooks/`
  and `types/`. This *looks* organized and is the main driver of "I don't know what I'm looking at":
  every kind of file ends up in N places, and cross-feature imports become unreviewable.
- More than one components folder (e.g. `components/` **and** `shared/components/`). There is one.
- A second home for services, hooks, or types anywhere outside the tree above.
- Barrel `index.ts` files that re-export a folder's public surface. They hide the real location of every
  symbol, make imports lie about where code lives, and let dead exports survive. Import concrete files.
- Two components with the same name in different folders (`event/ScheduleCalendar` vs
  `schedule/ScheduleCalendar`). Prefix the more specific one; do not leave the ambiguity.
- A screen living anywhere but its page folder, or a page holding files other than `index.tsx`,
  `index.config.ts` and `*Screen.{tsx,scss}`.
- Route paths or the page list duplicated between `app.config.ts` and the router. One source of truth.

Placement findings are cheap to state and cheap to fix mechanically — but only if you *look*. Do not
score this Pass because imports resolve; score it on whether there is exactly one answer to "where does
this kind of file go?"

### 1. Architecture & layering
Pages compose, never display (see prime directive). Components take props, render, and call callbacks —
they do not fetch data, hold business logic, or know the backend shape. Data access stays behind
services/connectors; the real fetch/upsert logic lives there, never in components, and there is **no mock
data** where the project uses real connectors. External/raw shapes map to display models via adapters,
outside JSX. Shared code never imports feature code. One entry point per action.

### 2. File size, granularity & cohesion — *the balance*
Small, single-purpose files (rough guides: component < ~150 lines, service < ~200, pages thin, hooks
focused). But line count is a smell, not a law: the real test is **single responsibility**. Split a file
when it does two jobs or contains an independently reusable/testable part — at a *real seam*. Do **not**
split to hit a number, and do **not** create wrappers that only forward props or a file per one-liner:
needless fragmentation (indirection, prop-drilling, 100 trivial files) is as bad as a god-file. Split by
meaning, never `Part1`/`Part2`.

### 3. DRY & reuse
No copy-pasted logic or markup; repeated patterns become a shared component/helper/hook. Reuse what already
exists before creating anything new — search the component library and `lib` first. No two implementations
of the same thing living in parallel.

### 4. No hardcoding / magic values
No hardcoded data that should come from a connector/service. No magic numbers or strings — use named
constants, config, or design tokens. No hardcoded URLs, dimensions that should be tokens, or user-facing
copy scattered inline (especially where the project is localized / bilingual or multi-currency). Config
belongs in config.

### 5. Types & correctness
No `any` (isolate and justify in a comment if truly unavoidable). Prefer precise unions
(`'idle'|'loading'|'success'|'error'`) and a `Result<T>` shape over throw-everywhere. Model state with
discriminated unions and handle it exhaustively (a `never` default catches missed cases). Strict null
handling. Types live in dedicated files. Filters, formatting, parsing, adapters, and state transitions live
in **pure, testable helpers**, not inside JSX.

### 6. Async & error handling
Guard stale updates (ignore/cancel out-of-order results in effects). Always handle loading / error /
success. Never swallow errors. Avoid races. Surface errors to the UI through a real error state, not a
silent `catch {}`.

### 7. State management
Minimal and immutable. Don't store what you can derive; single source of truth. Don't lift state higher
than it needs to be, and don't keep effects whose only job is to mirror props into state. Never expose an
internal mutable array/object.

### 8. Performance & complexity — *make it actually fast*
Condensed ≠ optimized. Check for real:
- **Algorithmic:** no accidental O(n²) — no `.find`/`.filter` inside a `.map`/loop over real data; build a
  `Map`/`Set` for lookups. Hoist invariant work out of loops and out of render.
- **React render:** no expensive computation in the render body without `useMemo`; stable references
  (`useCallback`/`useMemo`) for props passed to memoized children so re-renders don't cascade; correct
  stable `key`s (never array index for dynamic lists); `React.memo` where it measurably helps; split
  contexts / colocate state so a change doesn't re-render the world; **virtualize or paginate large lists**
  instead of rendering thousands of nodes; debounce/throttle expensive handlers (search, scroll, resize);
  never create components inside render or pass fresh inline object/array literals to memoized children in
  hot paths.
- **Data:** fetch once and cache; no N+1 in connectors; select only the columns you need; respect the
  project's fetch cadence (e.g. poll-on-open, not always-on).
- **Bundle:** lazy-load heavy routes/components; import the function, not the whole library; keep imports
  tree-shakeable.

Balance: do **not** over-memoize trivial values or micro-optimize cold paths — that adds cost and clutter
for no gain. Optimize where it's hot; keep everything else simple.

### 9. Density & clarity
Eliminate boilerplate, redundant branches, and dead abstractions so the code is short *because it's well
factored*. But never trade readability for terseness — no cryptic one-liners; a senior engineer optimizes
for the next reader. Remove dead code, unused vars/imports/exports, commented-out blocks, and stale TODOs.
No placeholder or dead UI: every control works, is disabled, or is removed.

### 10. Naming & readability
Name by purpose (`GithubCard`, not `MainCard`; `formatNzd`, not `helper2`). Consistent conventions across
the codebase. Self-documenting code; comments explain *why*, not *what*; delete comments that just restate
the line.

### 11. Security
No hardcoded secrets/keys/tokens or invented prod URLs — `.env` only; never commit `.env` or the local DB
file. Validate/sanitize external input at boundaries; parameterized SQL only. No `npm audit fix --force`
without approval; document residual vulnerabilities.

### 12. Tests & quality gates
Tests are required for logic changes: connector sync / idempotency / cursor behavior, adapters, parsing,
and edge + error cases. Each connector ships its own idempotency test. Use the project's harness (e.g.
Vitest with in-memory SQLite and mocked clients + ESLint flat config). The gates — the project's
`typecheck`, `lint`, `test`, and `build` scripts — must all pass. Report exact results; never claim success
over a failure.

---

## Severity model

- **P0 — Critical:** incorrect behavior, security holes, swallowed errors, races, data-access/business
  logic inside components, mock data where real connectors are required, hardcoded secrets. Fix first.
- **P1 — High:** architectural violations (a page displaying/fetching, a god-file mixing concerns), `any`
  in real logic, missing stale guards, O(n²) on real data, missing tests for changed logic. Fix.
- **P2 — Medium:** duplication, magic values, needless fragmentation, over/under-memoization that affects
  perf, weak naming, dead code. Fix within scope.
- **P3 — Nit:** minor polish and light doc touch-ups. Fix if cheap.

---

## Report structure

ALWAYS use this exact template:

```
# Code Cleanup Report — <scope>

## Scorecard
| Category                     | Rating       |
|------------------------------|--------------|
| Layout & file placement      | Pass/Needs work/Fail |
| Architecture & layering      | …            |
| File size & granularity      | …            |
| DRY & reuse                  | …            |
| Hardcoding / magic values    | …            |
| Types & correctness          | …            |
| Async & error handling       | …            |
| State management             | …            |
| Performance & complexity     | …            |
| Density & clarity            | …            |
| Naming & readability         | …            |
| Security                     | …            |
| Tests & quality gates        | …            |

Overall: <one honest sentence — is this production-grade or not, and why>

## Findings
### P0 — Critical
- `path:line` — <what's wrong>. Why: <impact>. Fix: <specific change>.
### P1 — High
- …
### P2 — Medium
- …
### P3 — Nits
- …

## Remediation plan
1. <ordered, grouped by module/severity — what gets fixed, in what order>
2. …
(Note anything intentionally deferred and why.)
```

If mode is audit + fix, proceed into Phase 4 after the report. If audit-only, stop here.

---

## Remediation rules

- **The 3-pass rule (internal).** For every change: (1) draft it to the standard, (2) self-review
  unbiased — find the weakest parts and fix them, (3) assume the reviewer is unhappy with 1–2 and improve
  again. Ship the result of pass 3; don't narrate the passes.
- **Behavior-preserving by default.** Refactors must not change behavior. The only behavior changes are
  explicit bug fixes — call each one out.
- **Small, correct changes over large diffs.** Optimize for correctness and maintainability, not diff size.
  Work in reviewable units; for a whole-project scope, go module by module and checkpoint.
- **Keep the build green.** After each meaningful unit, run the gates. Never leave the tree broken between
  units.
- **Don't churn good code.** If code already meets the bar, leave it. Don't restructure stable, correct code
  without a concrete reason. Don't invent unrequested features or change public APIs to be clever.
- **Tests travel with logic.** Any logic you change or add gets its test updated/added in the same unit.
- **Communicate minimally.** Report what changed, results, and limitations in a few lines. Don't re-read
  files you just wrote or write essays for tiny edits. Update docs lightly; if the project keeps a
  "▶ Resume here" block, update it so the next session can continue.

---

## Fixing layout findings — the migration procedure

Moving files is the one remediation that is *mechanical but easy to botch*, because a half-finished move
leaves the tree in a worse state than before you started. Do it as a single deliberate operation, not as
file-by-file drift.

**Never hand-edit imports across a large move.** Pattern-replacing paths one at a time is how you get a
tree that typechecks but imports the wrong module. Instead:

1. **Build the complete map first, as data.** An explicit `old path → new path` table for every file,
   written down before anything moves. Derive it from the placement table in rubric 0. Assert the map is
   total (no source file unmapped) and injective (no two files landing on the same path) before you act.
2. **Resolve collisions at map time, not after.** Two files that would land on the same name are a
   finding: rename the more specific one (`EventScheduleCalendar`, not `event/ScheduleCalendar`), and
   rename the *exported symbols* too — a folder named `EventScheduleCalendar` exporting `ScheduleCalendar`
   is still ambiguous.
3. **Rewrite imports by resolving through the map, not by string substitution.** For each import
   specifier, resolve it against the *old* tree to a concrete file, look that file up in the map, and emit
   the new specifier. This handles relative imports, index resolution, and extensionless paths correctly;
   regex does not. Watch the forms a naive pass misses: `export … from`, inline `import('…')` types,
   side-effect `import './x.scss'`, and barrel re-exports that must be expanded per symbol.
4. **Dry-run and prove it.** Run the map + rewrite without writing anything and assert every specifier in
   every surviving file resolves. Fix the map until that is clean. Only then write.
5. **Move with `git mv`** so the diff reads as renames and history follows the file.
6. **Delete barrels last, and expand their symbols.** For `import { A, B } from '@/feature'`, look up
   which concrete module exports each symbol and emit one import per target.
7. **Verify with the gates, then read the emitted artifact.** Typecheck + lint + build is necessary but
   not sufficient — if the build produces a manifest (route list, page list, bundle map), diff it against
   the pre-move version. Byte-identical output is the proof the move was behavior-preserving.

**Update everything that names a path**, or the next session gets sent to dead files: architecture docs,
connector/endpoint tables, the repo's `CLAUDE.md`/`AGENTS.md`, and any structural guardrail scripts with
hardcoded paths. A guardrail pointing at a moved file silently passes and stops protecting anything.

**Then make the layout enforceable.** A restructure that isn't mechanically checked decays back within
weeks. Add (or update) a structure check that fails the build on: a banned folder reappearing, a second
components/services/hooks home, a component folder without an `index.tsx`, a page holding files it
shouldn't, and any import that violates the layer table. Land it with the move, in the same change.

**Layout findings are scoped work, not licence to rewrite.** Move files, fix the imports they force, and
rename genuine collisions. Do not also refactor the contents of what you moved — a move diff that also
changes behavior is unreviewable. If a moved file needs work, that is a separate finding at its own
severity.

---

## Judgment — the traps to avoid while cleaning up

The failure mode is over-correcting. Excellent code is a balance, not a maximization of any one axis.

- **Don't fragment.** Splitting a 500-line component into 30 files that forward props and drill state is
  *worse*, not better. Extract only at real seams (reuse, distinct responsibility, independently testable).
- **Don't over-abstract.** Indirection that doesn't earn its keep is a cost. Two similar things are often
  fine as two things; wait for a real third before generalizing.
- **Don't over-optimize.** `useMemo`/`useCallback` on trivial values and micro-tuning cold paths add
  clutter and cost for no benefit. Optimize measured hot paths; keep the rest simple.
- **Don't code-golf.** Short-because-cryptic is a regression. Short-because-well-factored is the goal.
- **Don't over-report.** The report is evidence-based and prioritized, not a wall of nits.

---

## Worked examples

**Perf — quadratic lookup and render-time work → precomputed map + memo:**
```tsx
// O(users × orders); recomputes every render
const rows = orders.map(o => ({ ...o, user: users.find(u => u.id === o.userId) }));

// O(users + orders); computed once
const byId = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
const rows = useMemo(() => orders.map(o => ({ ...o, user: byId.get(o.userId) })), [orders, byId]);
```

**Fragmentation — a wrapper that only forwards props → inline it:**
```tsx
// Adds a file and a layer for nothing
const CardTitle = ({ text }: { text: string }) => <h3 className="card__title">{text}</h3>;
// It's one line used in one place — just write it where it's used, or make it a real variant if reused.
```

**Data access — fetch in a component → behind a hook, component takes props:**
```tsx
// Component fetches, so it can't be reused, tested, or previewed
function GithubCard() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch("/api/github").then(r => r.json()).then(setData); }, []);
  return <Card>{/* ... */}</Card>;
}
// Data behind a hook (which calls the service); component is pure and prop-driven
function GithubCard({ items, status }: GithubCardProps) {
  if (status === "loading") return <CardSkeleton />;
  if (status === "error")   return <CardError />;
  return <Card>{/* render items */}</Card>;
}
```

---

## Finish checklist

Close every run with exactly this, in a few lines:

**inspected → issues found (by severity) → fixed → deferred (and why) → files changed → tests
added/updated → gate commands + exact results → limitations → "no unrelated features added."**

Do not say "done" unless every gate passed.
