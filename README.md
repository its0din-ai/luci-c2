# luci-c2

A custom LuCI theme for OpenWrt styled as a monospace, command-and-control console.

- Presentation only — restyles the existing OpenWrt admin UI. No backend, RPC, or network change.
- Full design and development rules: `SPEC.md`.
- State report and resume point: `PHASE.md`.
- Threat model: `THREAT.md`.

## Contents

- `SPEC.md` — theme spec; derives its process rules from `AGENTIC.md`.
- `PHASE.md` — mandatory state report; read first in any new session.
- `THREAT.md` — mandatory threat model; kept in sync with the code.
- `Makefile` — OpenWrt package definition.
- `htdocs/luci-static/c2/` — theme assets (`cascade.css`, `menu-c2.js`, logo, spinner, fonts).
- `ucode/template/themes/c2/` — `header.ut` / `footer.ut`.
- `root/etc/uci-defaults/30_luci-theme-c2` — registers and selects the theme.

## Usage

1. Build against an OpenWrt SDK: `make package/luci-theme-c2/compile` (see `PHASE.md` Verify).
2. Install the resulting `.ipk`, then select **C2** under System → System → Language and Style.
3. Development follows the atomic, phase-based loop in `SPEC.md` §4.
