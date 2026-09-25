# SPEC.md — luci-c2

Custom LuCI theme for OpenWrt, styled as a **monospace, command-and-control (C2) console**.

This document is the project spec. Its development rules are derived directly from
`~/Dev/boilerplates/AGENTIC.md` (standing rules for any project) and applied to a LuCI theme.
Where a rule below restates AGENTIC.md, AGENTIC.md wins on conflict.

> **Naming note.** "Command and control" here is a *visual motif* — terminal typography, status
> readouts, prompt-style UI. It is **not** offensive tooling and the theme has no C2 capability.
> It styles the existing OpenWrt admin UI; it adds no network, shell, or control channel.

---

## 1. Purpose & scope

- Deliver an installable OpenWrt package, `luci-theme-c2`, that restyles the LuCI web UI.
- Visual identity: dark phosphor terminal, monospace everywhere, dense command-console layout.
- **In scope**: CSS theme (`cascade.css`), menu renderer, header/footer templates, design tokens,
  packaging (Makefile, UCI defaults), self-hosted fonts, icons as inline SVG.
- **Out of scope**: new LuCI apps, backend/ucode RPC, auth, network features, actual C2 behavior.
- Presentation only. The theme must never weaken LuCI's existing auth, RBAC, CSRF, or session model.

## 2. Theme identity — "monospace, command and control"

### 2.1 Design language

- **Duotone only**: one dark background tone + one foreground tone. There is no second hue and no
  color-coded status — every other value is a tint of the foreground over the background.
- **No blinding styles**: no glow, no neon, no blinking, no scanlines, no gradients beyond a single
  tone-on-tone stripe. Quiet, low-glare surfaces.
- Terminal/console structure: sharp 1px borders, square corners (radius `0`), no soft shadows.
- State is expressed by **shape, border style, weight and text labels** (`[ ok ]`, `[warn]`, `[fail]`,
  solid vs dashed badge), never by hue.
- Every surface is a "panel"; every form is a "command prompt" (`>` prefix).
- Status-forward: persistent status strip (node, link state, UTC clock).
- Information density over whitespace; tabular alignment via monospace metrics.

### 2.2 Typography

- One family everywhere: monospace.
  `--c2-font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;`
- Fonts **self-hosted** (`.woff2` in `htdocs/luci-static/c2/`); system-mono fallback. No CDN.
- Base 14px / line-height 1.5 / letter-spacing 0.02em. Headings uppercase, tracked.
- No icon fonts — inline `<svg>` only.

### 2.3 Duotone tokens (CSS custom properties)

Exactly two source tones; all other tokens are tints composed from them (still duotone).

| Token | Role | Value |
|---|---|---|
| `--c2-bg` | the dark background tone | `#0b0d0c` |
| `--c2-fg` | the foreground tone | `#a8b5a8` |
| `--c2-fg-dim` | secondary text | `color-mix(in srgb, var(--c2-fg) 45%, var(--c2-bg))` |
| `--c2-fg-muted` | tertiary text | `color-mix(in srgb, var(--c2-fg) 30%, var(--c2-bg))` |
| `--c2-border` | 1px borders | `color-mix(in srgb, var(--c2-fg) 22%, var(--c2-bg))` |
| `--c2-fill` | hover/active fill | `color-mix(in srgb, var(--c2-fg) 6%, var(--c2-bg))` |

- Two tones only. New tokens must be derived from `--c2-bg`/`--c2-fg`, never a new hue.
- Interaction/selection inverts the two tones (foreground background, background text) — no accent color.
- No `box-shadow` glows, no saturation over ~10%, no pure white, no pure black.
- Contrast: body text and interactive text must meet WCAG AA against the background.

**Light mode (inverted duotone).** Light mode simply swaps the two tones: light background,
dark foreground. Only `--c2-bg` and `--c2-fg` change; every derived token follows automatically.

| Mode | `--c2-bg` | `--c2-fg` |
|---|---|---|
| dark (default) | `#0b0d0c` | `#a8b5a8` |
| light | `#e9ece9` | `#202720` |

Precedence: an explicit `[data-c2-theme]` attribute wins; otherwise `prefers-color-scheme` decides.

```css
@media (prefers-color-scheme: light) {
	:root:not([data-c2-theme="dark"]) { /* light tones */ }
}
:root[data-c2-theme="light"] { /* light tones */ }
```

- Set `color-scheme` on the root so native controls and scrollbars follow the mode.
- Both modes must pass the same AA contrast bar; keep both tones within the same hue family.
- No asset may hardcode a mode-specific color — use `currentColor` or a token.

### 2.4 Layout & components to restyle

- Chrome: header, brand/logo, status strip, breadcrumb, footer.
- Navigation: sidebar tree / command-palette, dropdowns, tabs.
- Forms: inputs, selects, checkboxes, radios, switches, buttons, validation states.
- Data: tables, key/value grids, progress bars, spinners, tags/badges, notifications/modals.
- LuCI system pages: status/overview, graphs, `logread`/console output, package lists.
- Prompt motif: primary inputs prefixed with `>`; monospace alignment of columns.

### 2.5 Mobile-first, accessibility & motion

- **Mobile-first**: author base rules for the smallest viewport first; add enhancements only inside
  `@media (min-width: 48em)` (two-column chrome) and `@media (min-width: 64em)` (wider grids).
- Small viewports: single column; navigation and tab strips scroll horizontally; tables scroll in a
  wrapper; form rows stack. No horizontal page overflow at 320px.
- Visible keyboard focus on every interactive element; no focus suppression without replacement.
- Respect `prefers-reduced-motion` and `prefers-contrast`; no animation is required for the design to
  read. No blinking cursor, no pulsing glows.

## 3. LuCI integration (accurate package layout)

Modern LuCI theme package structure (mirrors `luci-theme-openwrt-2020`):

```
luci-c2/
├── Makefile                                      # OpenWrt package definition
├── htdocs/luci-static/
│   ├── c2/
│   │   ├── cascade.css                           # the theme
│   │   ├── logo.svg
│   │   ├── favicon.svg                           # adaptive (dark/light) tab icon
│   │   ├── spinner.svg
│   │   └── *-*.woff2                             # self-hosted fonts
│   └── resources/
│       └── menu-c2.js                            # client-side menu renderer
├── root/etc/uci-defaults/
│   └── 30_luci-theme-c2                          # register + select theme
└── ucode/template/themes/c2/
    ├── header.ut
    └── footer.ut
```

- **Makefile**: standalone external-theme pattern (as used by `luci-theme-argon`):
  `PKG_NAME:=luci-theme-c2`, `LUCI_TITLE`, `LUCI_DEPENDS:=+luci-base`, `PKG_LICENSE`, a `postrm`
  that deletes `luci.themes.C2` and commits `uci`, then `include $(TOPDIR)/feeds/luci/luci.mk`,
  which installs the `htdocs/`, `root/` and `ucode/` trees.
- **UCI defaults** `30_luci-theme-c2`: idempotent; sets `luci.themes.C2=/luci-static/c2` and
  selects `luci.main.mediaurlbase`; no user input.
- **Templates** `header.ut`/`footer.ut`: override the base theme's chrome; escape all variables
  (see §7); reference assets with relative paths.
- **Menu** `menu-c2.js`: extend the base menu module; no inline handlers, no `eval`.
- **CSS override strategy**: target LuCI's documented cascade selectors/IDs and prefer token
  overrides over `!important`; keep `!important` as a last resort and comment why.
- Assets are static and self-contained: no external hosts, no telemetry, works offline/air-gapped.

## 4. Development process (from AGENTIC.md §4)

Atomic, phase-based. Never build the whole theme (or a whole phase) in one shot.

- A **phase** is one named milestone (`phase_00_bootstrap`, `phase_01_core_tokens`, ...).
  A phase starts only after the previous one is complete and verified.
- A **micro-task** is the smallest unit delivering one behavior change, and must:
  - do exactly one thing,
  - leave the tree with **zero warnings** and all checks green,
  - be reviewable/committable as one logical unit.
- One micro-task at a time. No parallel tracks, no half-finished styles merged "for later".

Micro-task loop (every time):

1. **State** the micro-task and its phase.
2. **Implement** the smallest change that satisfies it.
3. **Verify** — lint/build the relevant artifacts; zero warnings; checks green.
4. **Security pass** — apply §7; update `THREAT.md` if the change adds/mitigates/removes a threat.
5. **Clean up** — tear down every process/VM/artifact the verification started (test hygiene).
6. **Record** the outcome in `PHASE.md`.

**Test hygiene (loopback only).** Any dev/test LuCI instance binds **only** to `127.0.0.1`
(never `0.0.0.0`, never a LAN interface) — e.g. QEMU/OpenWrt `hostfwd=tcp:127.0.0.1:<port>-:80`.
After each pass, shut the instance down, remove snapshots, build output, and temp files. A failed
check is not an excuse to leave the environment dirty.

**Orient first.** At session start (and after any compaction/resume), confirm the project root
with `pwd`/`ls`, verify the paths in `PHASE.md` Workspace block, correct them if wrong. Never trust
memory.

**Mandatory state files.** `PHASE.md` (from the AGENTIC starter template) and `THREAT.md` are
created before the first micro-task and updated after every micro-task. A fresh session reads
`PHASE.md` first, verifies the claimed state, then resumes the stated next micro-task.

## 5. Naming (from AGENTIC.md §1)

- Default `snake_case` for files, dirs, identifiers.
- Language/ecosystem-forced exceptions override (and must keep the linter at zero warnings):
  - LuCI-required filenames: `Makefile`, `cascade.css`, `menu-<slug>.js`, `header.ut`, `footer.ut`,
    `30_luci-theme-<slug>`.
  - JavaScript identifiers follow the JS row of the AGENTIC table: `camelCase` vars/functions,
    `PascalCase` classes/components.
  - CSS custom properties use kebab-case (`--c2-font-mono`) — CSS idiom.
- Non-language layers still use `snake_case`: JSON/API fields, `.env`/config keys, log keys,
  URL routes/slugs.
- `*.md` files are **UPPERCASE**: `SPEC.md`, `PHASE.md`, `THREAT.md`, `README.md`.
- CSS classes/ids prefixed `c2-` to avoid colliding with LuCI/other themes.

## 6. Comments & simplicity (from AGENTIC.md §2–3)

- Comments minimal: describe what a block/section does, never restate the declaration.
- KISS: no speculative abstractions, no build tooling or dependencies not justified by the task.
  Prefer plain CSS + vanilla ES modules; add a tool only when a rule (§4 zero-warnings, §7 security)
  actually requires it.
- Never introduce a third-party CSS/JS library without noting why in `PHASE.md`.

## 7. Security (from AGENTIC.md §7) — strict by default

The theme inherits LuCI's auth/RBAC; it must **never** weaken or bypass it. Default remains strict;
downgrading requires the user's explicit request, recorded in `PHASE.md`. Input validation, secrets
handling, and dependency auditing are never dropped.

Theme-specific controls:

- **Server-side templates (`*.ut`)**: escape every interpolated variable; never emit raw user or
  device data into HTML/JS context. Treat all values as untrusted.
- **No dynamic HTML**: no `innerHTML`/`eval`/`Function` with dynamic data; build DOM nodes explicitly.
- **No external egress**: no CDN, font, analytics, or telemetry requests. All assets self-hosted.
- **CSP-friendly**: no inline `<script>`/`<style>` or inline event handlers from the theme.
- **Root-context script**: `30_luci-theme-c2` runs as root — no user input, POSIX-`sh` safe,
  idempotent, no shell string construction from variables.
- **Asset provenance**: vendored fonts/icons carry their license; no opaque minified third-party blobs.
- **Logging**: no `console.log` of page data; never log credentials, tokens, or session values.
- **Review gate**: no micro-task is complete until its security pass is satisfied.

Seed `THREAT.md` with at least: template-output XSS, external-asset data leak / broken offline
support, supply-chain asset tampering, theme weakening LuCI access control, and root-script misuse.

## 8. Secrets & config (from AGENTIC.md §8)

- All config in `.env`; never hardcode secrets; never rely on system env for app config.
- Ship `.env.example` with every required key, kept in sync in the same micro-task that adds/renames
  a key. Theme-relevant keys (starting point):

```
theme_slug=c2
theme_version=
font_source_path=
openwrt_sdk_path=
test_host=127.0.0.1
test_port=
```

- `.env` is git-ignored; no real secret is ever staged.

## 9. No unsafe code (from AGENTIC.md §9)

- No `eval`, `Function`, dynamic `innerHTML`, unchecked casts, or shell/SQL string concatenation.
- Handle bounds/absence explicitly; no panics/`!` as control flow; no silent catch-all swallowing.
- If something genuinely needs a risky pattern, stop and get explicit approval first.

## 10. Git hygiene (from AGENTIC.md §10)

- `.gitignore` present before the first commit (adapt the boilerplate: exclude `.env`, keys,
  `build/`, `dist/`, `bin/`, snapshots, `*.log`, OS/editor files).
- One atomic commit per micro-task, message describing that change.
- Never stage `.env` or any secret.

## 11. When rules conflict (from AGENTIC.md §11)

If a request would violate a rule (e.g. "load the font from a CDN", "inline this script for now",
"skip PHASE.md and do it all at once"), say so before complying. Do not silently comply.

## 12. Verify (exact commands — fill concrete values in `PHASE.md`)

- **Lint CSS**: stylelint on `htdocs/luci-static/c2/cascade.css` → 0 warnings.
- **Lint JS**: ESLint on `htdocs/luci-static/resources/*.js` → 0 warnings.
- **Syntax-check ucode**: `ucode -c` (or LuCI's template check) on `ucode/template/themes/c2/*.ut`.
- **Shell**: `shellcheck` on `root/etc/uci-defaults/30_luci-theme-c2` → 0 warnings.
- **Package build**: `make package/luci-theme-c2/compile` (OpenWrt SDK) → no errors/warnings.
- **Install/runtime test**: LuCI instance on `127.0.0.1:<test_port>` in QEMU; theme selected;
  pages render; tear down + clean artifacts after the pass.

## 13. Proposed phase plan

| Phase | Goal |
|---|---|
| `phase_00_bootstrap` | Repo scaffold (`SPEC.md`, `PHASE.md`, `THREAT.md`, `.gitignore`, `.env.example`), package skeleton, Makefile, uci-defaults, empty theme registers and is selectable. |
| `phase_01_core_tokens` | Design tokens + reset + base typography in `cascade.css`; header/footer chrome. |
| `phase_02_navigation` | `menu-c2.js`, sidebar/command navigation, status strip, breadcrumbs. |
| `phase_03_components` | Forms, buttons, tables, tabs, modals, notifications, tags, spinners. |
| `phase_04_dashboards` | Status/overview widgets, graphs, `logread`/console surfaces. |
| `phase_05_responsive_a11y` | Breakpoints, focus states, reduced motion/contrast, AA contrast, keyboard nav. |
| `phase_06_packaging` | `postrm`, versioning, install/upgrade test on device/VM, `README.md`. |

## 14. Out of scope

- Backend/ucode apps, RPC, auth changes, network configuration.
- Any real command-and-control, remote-execution, or offensive capability.
- Third-party CSS/JS frameworks, runtime CDNs, analytics, icon fonts.
- Rounded/glassmorphism "modern dashboard" styling — conflicts with the terminal motif.
- Security downgrades beyond what the user explicitly requests and records in `PHASE.md`.
