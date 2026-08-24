# NimWord UI Plan — 7 Fixes

**Status: PLAN ONLY. No code written. Awaiting your approval.**

Baseline verified before writing this (nothing below is assumed):

| Check | Result |
|---|---|
| Client build | green — 205 modules, CSS 70.33 kB / 13.73 kB gzip |
| Server tests | 175/175 pass, 7 suites |
| `styles.css` | 4,680 lines |
| Uncommitted | `client/src/styles.css` only (74+/59−) |
| GSAP installed | `gsap@^3.15.0` ✅ — **`@gsap/react` NOT installed** |
| Game logic touched so far | none |

Constraint honoured throughout: **no game logic.** `src/game.js`, `src/config/*`, hooks, and all
`server/` code stay untouched. Every change below is presentation.

---

## 0. Seven conflicts between the spec and the current code — decide before I build

I checked each instruction against the actual code instead of implementing blind. Seven items in
the spec don't match what's there. **Items A, B and C would visibly break the app if built as
written.** My recommendation is marked ▶ in each case.

### A. `#F0F2FF` button text would be invisible — the spec assumes a dark theme

Fix 3 says ghost and secondary buttons get `#F0F2FF`, describing secondary as "dark background".
The app is **light** now — I verified 0 opaque dark backgrounds remain. Measured contrast:

| Pairing | Ratio | WCAG |
|---|---|---|
| `#F0F2FF` on `--surface` `#FFFFFF` | **1.11:1** | FAIL — invisible |
| `#F0F2FF` on `--ground` `#F9F9F9` | **1.05:1** | FAIL — invisible |
| current `--ink-2` `#4C4F6D` on `#FFFFFF` | 7.93:1 | PASS AAA |

`.button-secondary` / `.ghost-button` are `background: transparent` with `color: var(--ink-2)`
(`styles.css:124-130`). Applying `#F0F2FF` re-introduces the exact 50-declaration invisible-text
bug family I removed last session.

▶ **Recommendation:** keep dark ink on transparent/light buttons (§3 has the table). If you
actually want the dark theme back, say so — that's a separate, larger job, not a button fix.

### B. `overflow: hidden` on desktop will clip content permanently

Fix 1's snippet puts `height:100vh; overflow:hidden` on `body, html, #root`. I checked for inner
scrollers: **no feed, list, or table has `max-height` or `overflow-y` anywhere.** Every long
surface — live chat feed, leaderboard, achievements, settings — relies on **page** scroll today.
`overflow:hidden` doesn't compress that content, it makes it unreachable. On a 1280×720 laptop the
leaderboard would lose most of its rows with no way to reach them.

▶ **Recommendation:** the app-shell pattern in §1 — page never scrolls, *the one long panel
scrolls inside itself*. Same "everything fits, no page scroll" result, nothing unreachable.

### C. `@gsap/react` isn't installed, and your standing rule says packages come from nimiq.dev

Fix 4's snippet imports `useGSAP` from `@gsap/react` — a separate package, not installed.
Installing it from npm conflicts with your rule: *"any packages should be installed from
https://nimiq.dev/"*.

▶ **Recommendation:** plain `useEffect` + the already-installed `gsap@3.15`. Identical animations,
**zero new dependencies**, rule respected. `useGSAP` is only a cleanup convenience; `useEffect`
with a `gsap.context()` teardown does the same thing. All §4 code is written this way.

### D. GSAP tile tap would fight my existing CSS tile animations

`styles.css:3955` `.letter-tile--interactive` runs `@keyframes tileDeal`, and `:3986`
`.letter-tile--selected` runs `@keyframes tileSelectPop`. Both animate `transform`. Fix 4's
`animateTileTap` also writes `transform` via GSAP. Two engines on one property = visible jitter.

▶ **Recommendation:** GSAP owns the tap; I delete `tileSelectPop` (`:3986-4006`) and keep
`tileDeal` for the deal-in (it fires on mount, never overlaps a tap). One owner per property.

### E. `btn-gold` and `#E9B213` don't exist as a button

`grep` for `btn-gold` / `#E9B213`: **zero hits as a button.** `#E9B213` appears once, as a
drop-shadow on the logo (`styles.css:316`). Gold exists only as the `--nq-gold` token and
`--accent-gradient`. So "fix gold button text" has no target yet.

Worth noting: gold + `#1A1200` measures **9.59:1 (AAA)** — an excellent pairing. White on gold is
1.94:1, which fails badly, so your instinct to use dark text on gold is right.

▶ **Recommendation:** create one `.btn-gold` for the single highest-value action (Claim Reward),
using your `#1A1200`. Everything else stays blue. Gold stays scarce so it keeps meaning.

### F. 6 of the 25 requested emoji are already there

`🎮` is already on the stake button (`game-screens.jsx:124`), and `⭐ Daily Challenge`,
`🎯 Practice Arena`, `🏆 Leaderboard`, `⚡ 60s Rounds` are already in place. 43 emoji exist across
the screens. §5 is therefore a **delta table** — 6 already done, 2 changed, 17 new — not 25 adds.

### G. Found while measuring: white on `#0582CA` fails AA, and so does `--ink-muted`

Not in your spec; found by computing ratios rather than eyeballing them.

| Pairing | Ratio | Verdict |
|---|---|---|
| white on `--nq-blue` `#0582CA` | **4.16:1** | FAIL AA for 14.4px button text (needs 4.5:1) |
| white on `--nq-blue-deep` `#04639A` | 6.45:1 | PASS AA |
| `--ink-muted` `#797B91` on white | **4.15:1** | FAIL AA — this one is my own from last session |
| `--ink-muted` at `L=0.55` → `#6E7085` | 4.86:1 | PASS AA |

Both are one-line token changes. Fixing them is how "no dim, low-contrast text" (your Fix 3 goal)
actually gets met, and Design & UX is 25 of the 105 rubric points.

▶ **Recommendation:** darken button background to `--nq-blue-deep`, darken `--ink-muted` to
`L=0.55`. Included below; say the word if you'd rather I leave them.

---

## 1. Fix 1 — No desktop scroll (app-shell approach)

**Goal restated:** at ≥768px the page itself never scrolls; everything is reachable.

**Why not the literal snippet:** see §0-B. `overflow:hidden` on the page hides content instead of
fitting it.

**Approach — three layers.** The page is a fixed-height flex column; exactly one child scrolls.

```
┌─ #root  height:100dvh, overflow:hidden ────────┐
│ ┌─ .page-shell  flex column, min-height:0 ───┐ │
│ │  header / hero      ← fixed, never scrolls │ │
│ │ ┌─ scroll region  flex:1, overflow-y:auto ┐│ │  ← only this scrolls
│ │ │  feed / leaderboard / long lists        ││ │
│ │ └─────────────────────────────────────────┘│ │
│ │  bottom actions     ← fixed, always visible│ │
│ └────────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**CSS to append at end of `styles.css` (after `:4680`):**

```css
@media (min-width: 768px) {
  /* dvh not vh: vh mis-measures when desktop browser UI is present. */
  html, body, #root { height: 100dvh; overflow: hidden; }

  .page-shell {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    /* min-height:0 is load-bearing: without it a flex child refuses to
       shrink below content height and the overflow escapes the shell. */
    min-height: 0;
    overflow: hidden;
    padding: 1.25rem 1.1rem 1rem;   /* was 2rem 1.1rem 3rem */
  }

  /* The one scroll region. Everything else is fixed furniture. */
  .room-panel--feed,
  .chat-feed,
  .leaderboard-table,
  .achievement-grid,
  .settings-list,
  .player-list {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }

  .hero { flex: 0 1 auto; min-height: 0; overflow: hidden; }

  /* Desktop has no bottom nav, so the mobile clearance is dead space. */
  .page-shell, .room-panel, .profile-panel { padding-bottom: 1rem !important; }
}
```

**Density reductions so content fits (all inside the same `min-width:768px` block):**

| Selector | Current | Desktop |
|---|---|---|
| `.page-shell` `:163` | `padding: 2rem 1.1rem 3rem` | `1.25rem 1.1rem 1rem` |
| `.hero-copy` `:204` | `padding: 2.2rem` | `1.5rem` |
| `.hero-logo` `:311` | `margin-bottom: 1.2rem` | `0.6rem` |
| `.lede` | `font-size:1.05rem; line-height:1.75` | `0.95rem; 1.5` |
| `.page-shell` `:2489` | `padding-bottom: 7rem` | `1rem` |
| `.page-shell` `:2957` | `padding-bottom: 9rem` | `1rem` |
| `.page-shell` `:3105` | `padding-bottom: 8.5rem` | `1rem` |

**Verification:** measure `document.body.scrollHeight` vs `innerHeight` at 768/1024/1280/1440×
{720, 800, 900}. Pass = no page scrollbar **and** every panel reachable. I'll report the numbers.

---

## 2. Fix 2 — Logo / wordmark balance

`.hero-logo` exists as specified. JSX at `game-screens.jsx:131-138` needs **no change**.

**Current vs planned — `styles.css:306-330`:**

| Property | Current | Planned | Why |
|---|---|---|---|
| `.hero-logo` gap `:310` | `0.25rem` | `0.875rem` | your value; `-0.55rem` negative margin removed |
| `.hero-logo__img` height `:317` | `clamp(68px, 9vw, 96px)` | `48px` desktop / `44px` mobile | fixed, so it can't outgrow the text |
| `.hero-logo__img` width `:318` | `auto` | `48px` + `object-fit:contain` | square box, no distortion |
| `.hero-logo__img` `margin-right` `:319` | `-0.55rem` | **removed** | this is what unbalanced them |
| `.hero-logo__img` filter `:316` | `drop-shadow(...rgba(233,178,19,.35))` | `drop-shadow(0 2px 8px oklch(0.7924 0.1593 85.61 / 0.3))` | last raw hex in the block |
| `.hero-logo__name` size `:326` | `2.6rem` | `2rem` | your value |
| `.hero-logo__name` weight `:327` | `700` | `900` | your value |
| `.hero-logo__name` tracking `:328` | `0.04em` | `-0.02em` | Mulish at display weight wants negative |

```css
.hero-logo { align-items: center; display: flex; flex-direction: row; gap: 0.875rem; margin-bottom: 1.2rem; }
.hero-logo__img {
  border-radius: 8px; display: block; flex-shrink: 0;
  filter: drop-shadow(0 2px 8px oklch(0.7924 0.1593 85.61 / 0.3));
  height: 48px; object-fit: contain; width: 48px;
}
.hero-logo__name {
  color: var(--ink); font-family: var(--font-sans); font-size: 2rem;
  font-weight: 900; letter-spacing: -0.02em; line-height: 1; margin: 0;
}
```

**Optical balance note:** a 48px box next to 2rem/900 text is *metrically* equal but reads slightly
small, because cap-height is ~70% of font-size. I'll screenshot at 1280×800 and, if the mark looks
light, raise the image to 52px — one value, adjusted once, on evidence rather than by formula.

Also updating the ≤820px override at `:3775-3802`, which currently re-declares
`height: clamp(56px,14vw,74px)` and `margin-right:-0.45rem` and would otherwise undo the above.

---

## 3. Fix 3 — Button text colour, before → after

Every value below is measured, not estimated. Target: **≥4.5:1** (AA for 14.4px button text).

| Variant | Where | BG before → after | Text before → after | Ratio |
|---|---|---|---|---|
| Primary | `styles.css:103`, `:2541`, surface layer `:3458` | `--interactive` `#0582CA` → `--interactive-ink` `#04639A` | `--surface` white (unchanged) | 4.16 → **6.45** ✅ |
| Secondary | `:124`, `:1882`, `:2557` | `transparent` / `rgba(255,255,255,.7)` → `transparent` | `--ink-2` `#4C4F6D` **kept** (spec's `#F0F2FF` = 1.11:1) | **7.93** ✅ |
| Ghost | `:124-130` | `transparent` | `--ink-2` **kept** | **7.93** ✅ |
| **Gold (new)** | new `.btn-gold` | `#E9B213` | `#1A1200` — your value | **9.59** ✅ |
| Blue accent | `:1889` `.button-accent-blue` | `--interactive` → `--interactive-ink` | white | **6.45** ✅ |
| Stake presets | `game-screens.jsx:169-176` inline | active `oklch(.7924 .1593 85.61/.3)` | `--nq-gold` → `--ink` | 2.1 → **12.4** ✅ |
| Disabled | `:117-122` | unchanged | `opacity:.55` → `.6` + explicit `--ink-muted` | ≥4.5 ✅ |

`#1A1200` on `#E9B213` is exactly right and I'm using it as given.

**Token change (§0-G):** `--ink-muted` `oklch(0.5889 …)` → `oklch(0.55 0.0335 281.21)` = `#6E7085`,
4.15 → 4.86:1. One line at `styles.css:31`; lifts all 15 label declarations at once.

**New rule:**
```css
/* The one gold button: highest-value action only (Claim Reward). Dark brown,
   not black — #1A1200 on #E9B213 is 9.59:1, and white on gold is 1.94:1. */
.btn-gold {
  background: var(--nq-gold) !important;
  border: 1px solid oklch(0.72 0.16 85.61) !important;
  box-shadow: 0 1px 0 oklch(0.72 0.16 85.61), 0 4px 12px oklch(0.7924 0.1593 85.61 / 0.3) !important;
  color: #1A1200 !important;
  font-weight: 900 !important;
}
```

**Files audited for buttons** (as you listed): `game-screens.jsx` Home `:184,189-202` / Lobby
`:719` / MatchRoom `:1021`; `daily-challenge.jsx:833,854,885`; `practice-screen.jsx:77,80,342,359,423,430`;
`meta-screens.jsx:172,372,418`; `styles.css` all variants above. I'll re-run the contrast script
over every button pair afterwards and paste the table.

**Consolidation:** `button {` is declared 3× (`:103`, `:1868`, `:2541`) and `button:hover` 3×
(`:1876`, `:2552`, `:3470`). Fix 4's hover would be a 4th. I'll fold them into one owner each
rather than stack another layer — otherwise the next colour fix has 4 places to miss.

---

## 4. Fix 4 — GSAP animations

New file: **`client/src/lib/game-animations.js`** — all six functions in one module, so timings live
in one place. Uses `gsap@3.15` only; **no new package** (§0-C).

| Function | Trigger | Target | Spec |
|---|---|---|---|
| `animateScreenIn(el)` | mount, each screen | `.page-shell` ref | `opacity 0→1`, `y 20→0`, 0.4s `power3.out` |
| `animateTileTap(el)` | tile `onClick` | the clicked tile | `scale 1→1.15`, 0.12s `back.out(3)`, `yoyo`, `repeat:1` |
| `animateWordAccepted(el)` | `myScore` increases | `.live-score` `:971` | `scale .8→1.3` + `#21BCA5` flash, 0.25s `back.out(2)` |
| `animateWordRejected(el)` | rejected feed entry | `.page-shell` | `x:8`, 0.06s, `yoyo`, `repeat:5`, reset in `onComplete` |
| `startTimerUrgency(el)` | `timeLeft` ≤ 10 && > 0 | `.timer-tone` `:964` | `scale 1.1` + `#D94432`, 0.4s, `repeat:-1` |
| `stopTimerUrgency(el)` | `timeLeft` > 10, round ends, unmount | same | kill tween, clear props |

`stopTimerUrgency` is not in your spec but is required: `repeat:-1` never ends on its own, so
without it the tween leaks past the round and keeps mutating a live DOM node.

**Trigger wiring — how each hooks in without touching logic:**

- **Screen entrance** — `useRef` on the existing `<main className="page-shell">` (`game-screens.jsx:128`,
  `:545`, `:941`) + `useEffect(() => animateScreenIn(ref.current), [])`. Adds a ref and an effect;
  reads no game state.
- **Tile tap** — `game-screens.jsx:993` `onClick={() => handleToggleTile(index)}` becomes
  `onClick={(e) => { animateTileTap(e.currentTarget); handleToggleTile(index); }}`.
  `handleToggleTile` is called with the same argument, unchanged; the animation is a side effect
  before it. Same at `:273` for the sample rack.
- **Word accepted** — `useEffect` on the existing `myScore` value (`:971`); fires when it rises.
  Derived state only, no new state.
- **Word rejected** — `useEffect` watching the newest feed entry's existing `accepted` flag
  (`game-ui.jsx:116`); fires on `false`.
- **Timer** — `useEffect` on the existing `timeLeft` (`:787`); starts ≤10, stops otherwise.

**Reduced motion:** every function early-returns on
`matchMedia("(prefers-reduced-motion: reduce)").matches`. My global clamp in the mobile block
(`:4555+`) only governs CSS, so GSAP needs its own guard.

**CSS hover/press** — replaces the 3 competing `button:hover` rules (§3), not appended to them:
```css
button:hover:not(:disabled) { transform: translateY(-2px); transition: transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1); }
button:active:not(:disabled) { transform: translateY(0) scale(0.97); }
```
Note: this replaces the 3D `perspective/rotateX` press at `:3478` and `:4034` with your flatter
lift. Fine — but it's a deliberate change to the "physical tile" feel, so flagging it, not
silently overwriting.

**Deleting** `@keyframes tileSelectPop` + its rule (`:3986-4006`) per §0-D. `tileDeal` stays.

---

## 5. Fix 5 — Emoji plan (delta)

**Already correct — no change (6):**

| Emoji | File:line | Text |
|---|---|---|
| 🎮 | `game-screens.jsx:124` | `Stake ${stakeAmount} NIM & Play` |
| ⚡ | `:125` | `Connect Nimiq Wallet` |
| ⚡ | `:145` | `60s Rounds` |
| ⭐ | `:190` | `Daily Challenge` |
| 🎯 | `:193` | `Practice Arena` |
| 🏆 | `:199` | `Leaderboard` |

**Changed (2):**

| File:line | Before | After | Why |
|---|---|---|---|
| `game-screens.jsx:146` | `🪙 {stakeAmount} NIM Stake` | `💰 {stakeAmount} NIM Stake` | your 💰 |
| `game-screens.jsx:147` | `🏆 90% Win Pool` | `🥇 90% Win Pool` | your 🥇; also frees 🏆 for Leaderboard, which currently duplicates it |

**New — LobbyScreen (5):**

| Emoji | File:line | Target |
|---|---|---|
| 👑 | `game-screens.jsx:520` area | HOST badge |
| ✅ | `:719` | `Entry Paid` |
| ⏳ | `:622-623`, `:731-733`, `:755` | all `Waiting for…` strings |
| 🚀 | `:615` | ready notice (`lobby-readiness-card--ready`) |
| 🔗 | `:633` | `Invite friends to join this room` |

**New — MatchRoomScreen (5):**

| Emoji | File:line | Target |
|---|---|---|
| ⏱ | `:964` | next to `<TimerTone>` |
| ⚡ | `:970` | `Your score` |
| 🔴 | `:1033` | `Live Chat Feed` header dot |
| ✅ | `game-ui.jsx:119` | accepted word (`accepted === true`) |
| ❌ | `game-ui.jsx:119` | rejected word (`accepted === false`) |

Feed emoji go in the existing `accepted ? … : …` ternary at `game-ui.jsx:119` — a branch that
already exists; I add the glyph to each side, no new condition.

**New — Results (5):** 🥇🥈🥉 by rank in `rank-badge.jsx` (already receives `rank`; consumed by
`leaderboard-row.jsx:12` and `player-card.jsx:13`) · 💎 on Claim Reward (`game-screens.jsx:1123` area)
· 😔 on the no-reward message (`:811-819`).

**New — Daily Challenge (4):**

| Emoji | File:line | Before → After |
|---|---|---|
| 🎉 | `daily-challenge.jsx:820` | `Target Reached ✓` → `🎉 Target Reached` |
| 🏆 | `:854` | `✓ Reward Claimed` → `🏆 Reward Claimed` |
| 🌅 | `:588` | `Come back tomorrow for your next reward.` |
| 🔄 | `:833`, `:885` | `Play Again`, `Play Again Tomorrow` |

**`practice-screen.jsx` has 0 emoji** and isn't in your list — leaving it alone rather than
inventing placements.

**Accessibility:** each emoji is decorative next to a text label, so it gets
`<span aria-hidden="true">` — otherwise screen readers announce "party popper target reached".
Where an emoji is the *only* content (🔴 dot, 🥇 badge) it gets an `aria-label` instead.

---

## 6. Fix 6 — Floating 3D letter tiles background

New file **`client/src/components/ui/floating-tiles-bg.jsx`**, canvas-based, your implementation
with five corrections:

1. **`gsap` import removed** — your snippet imports it but never uses it (the loop is
   `requestAnimationFrame`). Unused import.
2. **HiDPI** — `canvas.width = innerWidth * devicePixelRatio` + `ctx.scale(dpr, dpr)`. Without it
   tiles are visibly blurry on every retina/4K screen.
3. **Reduced motion** — render one static frame and skip the loop when the user asked for less
   motion. A perpetual rAF loop is exactly what that setting is for.
4. **Pause when hidden** — stop on `document.hidden`; a background tab shouldn't burn battery on a
   decorative loop.
5. **Colours from tokens** — `#0582CA`/`#21BCA5` read from `--interactive` / `--nq-green` via
   `getComputedStyle`, so the background can't drift from the palette. Same values today.

Physics (`TILE_COUNT: 12`, sizes 28–52px, speed 0.3–0.9, opacity 0.04–0.12, rotation ±15°) kept
exactly as specified.

**Mount:** `game-screens.jsx:128`, first child of `<main className="page-shell">`, before
`<section className="hero">` — HomeScreen only, as you asked.

```jsx
<main className="page-shell">
  <FloatingTilesBg />
  <section className="hero">
```

Already compatible: `.page-shell` is `position: relative` (`:163`) and `.hero` is `z-index: 1`
(`:187`), so a `z-index: 0` fixed canvas sits behind content with no stacking change.
`pointer-events: none` + `aria-hidden="true"` as specified.

**Interaction with Fix 1:** the canvas is `position: fixed`, outside flow — it cannot affect the
no-scroll layout. That's why canvas is the right call here.

---

## 7. Fix 7 — Eliminate dead space

Measured, not eyeballed. Biggest offenders:

| Line | Current | Planned | Note |
|---|---|---|---|
| `:2957` | `padding-bottom: 9rem` | `9rem` mobile / `1rem` ≥768px | clears the mobile bottom nav; **desktop has none** — 144px of nothing |
| `:3105` | `padding-bottom: 8.5rem` | same treatment | same cause |
| `:2489` | `padding-bottom: 7rem` | same treatment | same cause |
| `:163` | `padding: 2rem 1.1rem 3rem` | `1.25rem 1.1rem 1rem` ≥768px | 48px top + 80px bottom |
| `:204` | `.hero-copy padding: 2.2rem` | `1.5rem` ≥768px | 35px per side |
| `:311` | `.hero-logo margin-bottom: 1.2rem` | `0.6rem` | |
| `:356` | `margin-top: 2.2rem` | `1rem` ≥768px | |

**Structural, not just numeric:**
- **Empty rulesets:** audited — **0 found.** Nothing to strip.
- **`.chat-room-layout` (`:1288`) is an empty-bodied rule** left from an earlier layout; removing it.
- **Collapse empty containers:** `.hero-actions`, `.feature-strip`, `.notice-strip` wrappers render
  their box even with no children. Adding `:empty { display: none }` so a conditional that returns
  nothing leaves no gap.
- **`gap` on empty flex parents:** `.hero-actions` (`:150`, `gap:0.6rem`) contributes gap between
  zero children. `:empty` guard covers it.
- **The 3 duplicate `button`/`button:hover` blocks** (§3) — dead CSS, ~40 lines.

I'll report CSS size before/after. Expect it **down**, since this is mostly deletion.

---

## Change manifest

| File | Change | Logic risk |
|---|---|---|
| `client/src/styles.css` | Fixes 1,2,3,7 + delete `tileSelectPop` + consolidate dupes | none — CSS |
| `client/src/lib/game-animations.js` | **NEW** — 6 GSAP functions | none — new file |
| `client/src/components/ui/floating-tiles-bg.jsx` | **NEW** — canvas bg | none — new file |
| `client/src/components/screens/game-screens.jsx` | 3 refs + 5 effects; emoji `:146,147,520,615,622,633,719,731,755,964,970,1033`; `FloatingTilesBg` at `:128`; 2 `onClick` wraps | **wraps 2 handlers** — same args, unchanged calls |
| `client/src/components/screens/daily-challenge.jsx` | emoji `:588,820,833,854,885`; `.btn-gold` on claim | none — text/class |
| `client/src/components/ui/game-ui.jsx` | ✅/❌ in existing ternary `:119` | none — existing branch |
| `client/src/components/ui/rank-badge.jsx` | 🥇🥈🥉 by existing `rank` prop | none — existing prop |
| `client/src/components/screens/meta-screens.jsx` | button contrast only | none — CSS class |
| `client/src/components/screens/practice-screen.jsx` | button contrast only | none — CSS class |

**Not touched:** `src/game.js` · `src/config/*` · all hooks · all `server/` · all tests.

**The only non-CSS-shaped edit** is wrapping two `onClick`s to fire a tile animation before the
existing handler. If you'd rather I not touch handlers at all, I can drive it from a `useEffect` on
`selectedIndexes` instead — slightly less crisp, zero handler edits. Say which.

---

## Verification (I'll paste real output, not claims)

1. `npm run build` — expect 205 modules, green
2. `npm test` in `server/` — expect 175/175
3. `git diff --name-only HEAD` — confirm no logic file
4. Contrast script over every button pair — table, all ≥4.5:1
5. `scrollHeight` vs `innerHeight` at 768/1024/1280/1440 × 720/800/900 — no page scroll, all panels reachable
6. Undefined-token + invisible-text audits — expect 0 / 0
7. `prefers-reduced-motion` on — no GSAP tweens, no canvas loop
8. CSS size before/after

---

## Decisions I need

| # | Question | My recommendation |
|---|---|---|
| A | Ghost/secondary text: `#F0F2FF` (invisible, 1.11:1) or keep dark ink (7.93:1)? | **keep dark ink** |
| B | Desktop scroll: literal `overflow:hidden` (clips content) or app-shell? | **app-shell** |
| C | GSAP: install `@gsap/react` (breaks nimiq.dev rule) or `useEffect` + installed gsap? | **useEffect, no new dep** |
| D | Tile tap: GSAP owns it and I delete `tileSelectPop`? | **yes** |
| E | Create `.btn-gold` for Claim Reward only? | **yes, scarce** |
| F | Fix the two AA failures I measured (`#0582CA`, `--ink-muted`)? | **yes, 2 lines** |
| G | Tile tap via handler wrap, or `useEffect` on `selectedIndexes`? | **handler wrap** — crisper |

Reply "approved" for all recommendations, or name the ones you want changed.

---

# Built — what changed from the plan

All seven fixes are in, with every ▶ recommendation (A–G) as approved. Five places
where the plan met the actual code and the code won:

| # | Plan said | Built instead | Why |
|---|---|---|---|
| 1 | `client/src/lib/game-animations.js` | `client/src/utils/game-animations.js` | There is no `lib/`. `utils/` is the convention (~100 files, JSDoc style, selective barrel). |
| 2 | GSAP targets `.timer-tone` | `.timer-pill` | `.timer-tone` is a CSS selector name. `TimerTone` (`game-ui.jsx:28`) renders `className="timer-pill"`. The planned selector would have matched nothing. |
| 3 | Fix 1: `overflow: hidden` on the shell | shell is the single scroller (`height: 100dvh; overflow-y: auto`) | Not one feed, list or table declares `max-height`/`overflow-y`. Clipping the shell would not make them scroll internally, it would cut them off — the bottom of the leaderboard becomes unreachable rather than merely far away. |
| 4 | Fix 7: desktop `padding-bottom: 1rem` | `1.35rem`, matching `padding-top` | Same intent, symmetric frame. `--nav-reserve` (100px) is for the breakpoints where the nav actually renders. |
| 5 | Fix 3 changed 2 AA failures | 11 fixed, at source | Measured rather than eyeballed. Details below. |

## Two things the plan got wrong about the DOM

**The bottom nav.** I first read it as rendering at every width and built `--nav-reserve`
around that. It does not: `.bottom-nav { display: none !important }` at `min-width: 769px`
has been there since before this work. So the plan's assumption was right and my
correction was wrong. Reserving 100px on desktop for an invisible nav was 78px of the
exact blank page Fix 7 exists to remove. Desktop now reserves 21.6px; the four mobile
reserves still use the token.

**Horizontal overflow, caused by Fix 1.** Making the shell a scroll container converted
three pre-existing viewport-fixed decorations — the tile canvas, `.page-shell::before`
(graph paper, `min(100vw, 1440px)`), `.page-shell::after` (blur) — into real sideways
scroll, because each is centred on the viewport while the shell is 1165px wide.
Measured: 740px of it at 1920, 260px at 1440, 100px at 1280, 0 at 1024 and below.
Fixed with `overflow-x: hidden` on the shell (`clip` is coerced to `hidden` once the
other axis scrolls). All three keep painting edge to edge, because the viewport and not
the shell is their containing block. Verified at seven widths from 360 to 1920 that no
in-flow element crosses the shell's right edge, so nothing real is hidden.

## Dead space removed (Fix 7)

- Four hand-picked bottom reserves (7rem / 8.5rem / 9rem / 7.5rem) → one measured
  `--nav-reserve: calc(6.25rem + env(safe-area-inset-bottom))`. Each was over-reserving
  20–60px.
- Desktop reserve 100px → 21.6px (nav is hidden there).
- Inline `marginBottom: 6rem` on `.chat-room-layout`, on top of the shell's own reserve.
- `.hero-copy` 2.2rem → 1.6rem 1.75rem on desktop.
- Eight containers that can render empty now collapse via `:empty`.
- `align-content: safe center` on the desktop shell: slack used to pool in one lump under
  the last card (155px at 1440). Now split top and bottom. `safe` is load-bearing — the
  same screens overflow at 1280 and below, and unsafe centring would lift the first card
  above the scroll origin where it could never be reached.

## Contrast: 11 failures found by measurement, all fixed at source

`--ink-muted` on `--surface-sunk` 4.45 → 4.64 · `--nq-green-deep` on white 4.49 → 5.20 ·
`--interactive` as text 4.16 → new `--interactive-ink` 6.45, applied at 10 JSX sites
including 0.68rem labels · `--bad` at 0.8rem 4.35 → new `--bad-ink` 6.03 ·
`GameSticker` failed on 3 of 5 fills (`--ink` on red 3.46, on blue 3.63, on blue-deep
2.34; white was worse on two of them) — each hue kept, lightness moved; `fastFingers`
flattened green→green because `--ink` fails on the `--nq-green-deep` end.
Final: **21/21 pass.**

## Verification (all 8 steps)

1. Build green — 207 modules, CSS 70.54 kB / 13.90 kB gzip
2. `server/` tests — **175/175**, 7 suites, 0 fail
3. No logic touched — 11 modified + 3 new, every one under `client/src/`; zero `server/`,
   zero hooks, zero game logic
4. Contrast — **21/21**
5. Desktop frame, headless Chrome at 1920/1440/1280/1024/900 — window scroll false at
   all five, shell is the scroller, nothing clipped, no horizontal scroll
6. Undefined tokens **0** (68 defined, 62 referenced) · invisible text **0**
7. `prefers-reduced-motion`, with a control: forced on → canvas pixels identical across
   700ms (loop never starts), no inline transform or opacity left on the shell, static
   field still painted. Off → loop running, shell caught mid-tween at
   `translate3d(0, 10.94px, 0)` / `opacity: 0.453`, proving the tween fires
8. CSS 70.47 → 70.54 kB (13.88 → 13.90 kB gzip), +83 lines

Not committed — left staged for you.
