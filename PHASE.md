# PHASE.md

State report for this project. Read this first. Update after every micro-task (per AGENTIC.md section 5). Top of file always answers "where are we right now?"

## Workspace (orientation)

Confirmed on session start with `pwd`/`ls` — never trust memory. A fresh agent reads this before touching any file.

- Project root (absolute path): `/Users/encrypt0r/Dev/www/luci-c2`
- App/source directory: same as project root (repo root == LuCI package root)
- Build/lint/test are run from: project root
- Notes: no OpenWrt SDK, `ucode`, `shellcheck`, `node`/`npm`, or `stylelint` present on this machine yet; runtime verification is best-effort until those are installed (see Verify).

## Current state

- Active phase: `phase_00_bootstrap` (complete)
- Micro-task just finished: MT3 — package skeleton (Makefile, uci-defaults, `cascade.css` tokens, logo/spinner, `menu-c2.js`, `header.ut`/`footer.ut`)
- Next phase / micro-task: `phase_01_core_tokens` — expand `cascade.css` into a full base (chrome, typography, layout) on top of the token block
- Current blockers: none
- Note: theme shell is derived from the official `luci-theme-openwrt-2020` (Apache-2.0) so no phase starts from an invalid UI.

## Verify

Commands that prove the current state builds, lints, and tests clean:

- Build: `make package/luci-theme-c2/compile` against an OpenWrt SDK (unavailable locally — deferred to `phase_06_packaging`)
- Lint: `sh -n root/etc/uci-defaults/30_luci-theme-c2`; `stylelint htdocs/luci-static/c2/cascade.css`; `eslint htdocs/luci-static/resources/*.js` (linters not installed locally yet)
- Test: install `.ipk` in a QEMU OpenWrt image bound to `127.0.0.1` only, select theme, load pages; tear down after (deferred)

Local, always-available checks:

- `sh -n root/etc/uci-defaults/30_luci-theme-c2` → exits 0 (passes)
- `xmllint --noout htdocs/luci-static/c2/*.svg` → exits 0 (passes)
- required package paths exist (see phase_00 layout in `SPEC.md` §3) (passes)
- no external network URLs in theme assets (only SVG `xmlns` namespaces) (passes)

## Phase log

| Phase | Micro-task | Status | Notes |
|---|---|---|---|
| phase_00_bootstrap | MT1 scaffold state files | done | `PHASE.md`, `THREAT.md`, `.gitignore`, `.env.example`, `README.md` seeded from boilerplate |
| phase_00_bootstrap | MT2 git init + scaffold commit | done | repo initialized on `main`; commit `cdf505c` |
| phase_00_bootstrap | MT3 package skeleton | done | Makefile, uci-defaults, token-only `cascade.css`, logo/spinner, `menu-c2.js`, `header.ut`/`footer.ut` (Apache-2.0, from openwrt-2020) |

## Decisions & notes

- The repo root **is** the LuCI package root (`Makefile` at root), matching the layout in `SPEC.md` §3; the package name is `luci-theme-c2`, theme slug `c2`.
- "Command and control" is a visual motif only — no offensive capability is implemented (recorded in `SPEC.md` §1).
- Naming: LuCI-forced filenames (`cascade.css`, `menu-c2.js`, `header.ut`, `footer.ut`) are accepted ecosystem exceptions; `*.md` docs stay UPPERCASE.
- Security tier: strict default (AGENTIC §7). No downgrade requested; nothing relaxed.
- Makefile uses the standalone external-theme pattern `include $(TOPDIR)/feeds/luci/luci.mk` (as `luci-theme-argon` does), not `../../luci.mk`, because this repo root is the package root. `PKG_NAME:=luci-theme-c2` is explicit so the package name does not fall back to the directory name (`luci-c2`).
- Tracks are all Apache-2.0; `header.ut`/`footer.ut`/`menu-c2.js` are adapted from `luci-theme-openwrt-2020` (© Jo-Philipp Wich) with attribution retained, keeping template escaping intact (mitigates `t_01_template_output_xss`).
- `CONFIG_LUCI_CSSTIDY:=` disables csstidy so the authored terminal CSS is served unchanged.
- Design revised (user request): strict **duotone** only — one background tone + one foreground tone, all other tokens tinted via `color-mix`. No second hue; status shown by shape/border-style/weight/labels; no glow, neon, blink, or scanlines. **Mobile-first** CSS (base = smallest viewport; enhancements at `48em`/`64em`). Reflected in `SPEC.md` §2 and `preview/`.
- **Light mode** (user request): inverted duotone — dark `#0b0d0c`/`#a8b5a8`, light `#e9ece9`/`#202720`. Only `--c2-bg`/`--c2-fg` switch; derived tokens follow. Auto via `prefers-color-scheme`, overridable by `[data-c2-theme]`; `color-scheme` set per mode. Assets use `currentColor` (logo/spinner updated). Preview has a toggle button.
- **Favicon** (user request): `htdocs/luci-static/c2/favicon.svg`, an SVG icon with an embedded `prefers-color-scheme` style so it adapts to the browser chrome. `header.ut` and the preview link it; `logo.svg` stays for branding.

## Out of scope

- Backend/ucode apps, RPC, auth, network configuration.
- Real C2/remote-execution functionality.
- Third-party CSS/JS frameworks, CDNs, analytics, icon fonts.
