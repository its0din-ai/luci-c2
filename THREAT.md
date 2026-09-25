# THREAT.md

Threat model for this project (per AGENTIC.md section 6). Created during initial planning, kept in sync with the code. Update whenever a micro-task introduces, mitigates, or removes a threat.

| threat_id | description | surface | level | severity | user_requested | mitigation |
|---|---|---|---|---|---|---|
| t_01_template_output_xss | Malicious device/user data is rendered unescaped by the theme's ucode templates (`header.ut`/`footer.ut`), executing script in the admin's browser and yielding session/CSRF access. | `ucode/template/themes/c2/*.ut` | likely | high | no | Escape every interpolated variable; never emit raw data into HTML/JS context. |
| t_02_external_asset_leak | Theme pulls fonts/CSS/JS from a CDN; leaks admin IP/referrer, breaks offline/air-gapped routers, and adds supply-chain exposure. | `cascade.css`, templates | firm | med | no | Self-host all assets under `htdocs/luci-static/c2/`; no external hosts; no telemetry. |
| t_03_asset_tampering | A vendored font/icon/JS blob is replaced or contains hidden code, yielding script execution in the admin UI. | `htdocs/luci-static/c2/*`, `resources/*.js` | possible | high | no | Vendor with source + license; no opaque minified third-party blobs; review diffs. |
| t_04_theme_weakens_access_control | Theme JS/CSS bypasses or hides LuCI's RBAC/auth checks, exposing privileged pages or actions to a low-privilege session. | `resources/menu-c2.js`, templates | possible | high | no | Presentation only; never alter auth/RBAC/CSRF; rely on LuCI's server-side enforcement. |
| t_05_root_script_misuse | The `uci-defaults` script runs as root; unsafe shell construction or user-influenced values yield command execution. | `root/etc/uci-defaults/30_luci-theme-c2` | possible | crit | no | No user input; POSIX `sh`, idempotent, no string-built commands; `shellcheck` clean. |
| t_06_inline_script_csp | Inline event handlers / `innerHTML` / `eval` in the theme widen XSS and violate a strict CSP. | `resources/menu-c2.js`, `.ut` | likely | med | no | No inline handlers or dynamic HTML; DOM APIs only; CSP-friendly output. |
| t_07_admin_data_logging | Theme logs page data, tokens, or session values to the console, leaking secrets to anyone with devtools/log access. | `resources/menu-c2.js` | possible | low | no | No `console.log` of page/session data; never log credentials or tokens. |

- `threat_id`: short snake_case id, e.g. `t_01_sql_injection`.
- `level`: how certain the threat applies — `certain`, `firm`, `likely`, `possible`, `speculative`.
- `severity`: impact if exploited — `info`, `low`, `med`, `high`, `crit`.
- `user_requested`: `yes`/`no`. `yes` = user explicitly wants the app vulnerable to this threat (e.g. security challenge/CTF) — keep it open, never "fix" it; mark the vulnerable surface in code with `# user_requested_vuln: <threat_id>`.
- `mitigation`: the control addressing the threat, or explicit "intentionally left open".
