# PHASE.md

State report for this project. Read this first. Update after every micro-task (per AGENTIC.md section 5). Top of file always answers "where are we right now?"

## Workspace (orientation)

Confirmed on session start with `pwd`/`ls` — never trust memory. A fresh agent reads this before touching any file.

- Project root (absolute path): `/Users/encrypt0r/Dev/www/luci-c2`
- App/source directory: same as project root (repo root == LuCI package root)
- Build/lint/test are run from: project root
- Notes: no OpenWrt SDK, `ucode`, `shellcheck`, `node`/`npm`, or `stylelint` present on this machine yet; runtime verification is best-effort until those are installed (see Verify).

## Current state

- Active phase: `phase_00_bootstrap`
- Micro-task just finished: MT1 — scaffold state files (`PHASE.md`, `THREAT.md`, `.gitignore`, `.env.example`, `README.md`)
- Next micro-task: MT2 — initialize git repo and make the first atomic commit of the scaffold
- Current blockers: none

## Verify

Commands that prove the current state builds, lints, and tests clean:

- Build: `make package/luci-theme-c2/compile` against an OpenWrt SDK (unavailable locally — deferred to `phase_06_packaging`)
- Lint: `sh -n root/etc/uci-defaults/30_luci-theme-c2`; `stylelint htdocs/luci-static/c2/cascade.css`; `eslint htdocs/luci-static/resources/*.js` (linters not installed locally yet)
- Test: install `.ipk` in a QEMU OpenWrt image bound to `127.0.0.1` only, select theme, load pages; tear down after (deferred)

Local, always-available checks:

- `sh -n root/etc/uci-defaults/30_luci-theme-c2` → exits 0
- required package paths exist (see phase_00 layout in `SPEC.md` §3)

## Phase log

| Phase | Micro-task | Status | Notes |
|---|---|---|---|
| phase_00_bootstrap | MT1 scaffold state files | done | `PHASE.md`, `THREAT.md`, `.gitignore`, `.env.example`, `README.md` seeded from boilerplate |
| phase_00_bootstrap | MT2 git init + scaffold commit | todo | |
| phase_00_bootstrap | MT3 package skeleton | todo | Makefile, uci-defaults, htdocs, ucode templates, menu |
| phase_00_bootstrap | MT4 verify + commit | todo | |
| phase_00_bootstrap | MT5 finalize state + commit | todo | |

## Decisions & notes

- The repo root **is** the LuCI package root (`Makefile` at root), matching the layout in `SPEC.md` §3; the package name is `luci-theme-c2`, theme slug `c2`.
- "Command and control" is a visual motif only — no offensive capability is implemented (recorded in `SPEC.md` §1).
- Naming: LuCI-forced filenames (`cascade.css`, `menu-c2.js`, `header.ut`, `footer.ut`) are accepted ecosystem exceptions; `*.md` docs stay UPPERCASE.
- Security tier: strict default (AGENTIC §7). No downgrade requested; nothing relaxed.

## Out of scope

- Backend/ucode apps, RPC, auth, network configuration.
- Real C2/remote-execution functionality.
- Third-party CSS/JS frameworks, CDNs, analytics, icon fonts.
