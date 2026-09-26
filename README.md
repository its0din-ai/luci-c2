# luci-c2

A custom LuCI theme for OpenWrt styled as a monospace, command-and-control console.
Duotone, mobile-first, with automatic light/dark mode.

- Presentation only — restyles the existing OpenWrt admin UI. No backend, RPC, or network change.
- Package name: `luci-theme-c2`; theme registered as **C2**.
- Prebuilt `all` `.ipk` plus a ready-to-use opkg feed are published on GitHub Releases by CI on every
  `v*` tag.
- Local development/process notes (`SPEC.md`, `PHASE.md`, `THREAT.md`) live in the untracked `llm/`
  directory and are not part of the distributed package.

## Requirements

- OpenWrt with LuCI (`luci-base`). The theme uses ucode templates, so it needs a LuCI that ships
  ucode (OpenWrt 21.02 and newer).
- A modern browser. The theme uses CSS `color-mix()` and `prefers-color-scheme` (Chrome/Edge 111+,
  Firefox 113+, Safari 16.2+).
- The package is architecture-independent (`PKGARCH:=all`).

## Install

### 0. Detect the device's package manager

OpenWrt images ship either **opkg** (classic) or **apk** (newer builds). Check which one is present:

```sh
command -v apk >/dev/null && echo apk || echo opkg
```

Use the matching section below.

### Option A — opkg (classic)

#### A1. From the GitHub package feed (recommended)

Every `v*` tag triggers `.github/workflows/release.yml`, which builds the architecture-independent
(`all`) `.ipk` and publishes an opkg feed — `Packages`, `Packages.gz` and the `.ipk` — on the GitHub
release. Add that release URL as a custom feed and use plain opkg:

```sh
# 1. add the feed (always tracks the newest release)
echo 'src/gz luci_c2 https://github.com/its0din-ai/luci-c2/releases/latest/download' >> /etc/opkg/customfeeds.conf

# 2. refresh indexes
opkg update

# 3. install (later: `opkg upgrade luci-theme-c2`)
opkg install luci-theme-c2
```

OpenWrt enables opkg signature checking for its official feeds (`option check_signature` in
`/etc/opkg.conf`). This third-party feed is **unsigned**, so if `opkg update` reports a signature error
for `luci_c2`, disable signature checking:

```sh
sed -i 's/^option check_signature/# option check_signature/' /etc/opkg.conf
opkg update
```

#### A2. From a local `.ipk`

```sh
# copy the package to the device first (scp/ssh), then:
opkg update
opkg install /tmp/luci-theme-c2_*.ipk
```

Remove:

```sh
opkg remove luci-theme-c2
```

### Option B — apk (newer builds)

The release also attaches a best-effort `.apk` (built from the OpenWrt **snapshot** SDK). Download it
from the [latest release](https://github.com/its0din-ai/luci-c2/releases/latest), copy it to the
device, then:

```sh
apk add --allow-untrusted /tmp/luci-theme-c2-*.apk
```

`--allow-untrusted` is required because the package is unsigned. An apk repository index
(`APKINDEX.tar.gz`) is not published yet — that feed is out of scope for now; open an issue if you
want it.

Remove:

```sh
apk del luci-theme-c2
```

## Build from source

The package is a standalone external LuCI theme and expects the `luci` feed to be present.

1. Add the `luci` feed to your OpenWrt buildroot/SDK:
   ```sh
   ./scripts/feeds update -a
   ./scripts/feeds install -a
   ```
2. Place this repository at `package/luci-theme-c2` (copy or symlink), or add it as a package feed.
3. Build the package:
   ```sh
   make package/luci-theme-c2/compile V=s
   ```

Output lands in `bin/packages/<arch>/luci/`:

- opkg build → `luci-theme-c2_<version>_all.ipk`
- apk build → `luci-theme-c2-<version>.apk`

The buildroot selects the package manager via the `CONFIG_USE_APK` option; the same source builds an
`.ipk` or an `.apk` accordingly. To ship the theme inside a firmware image instead, enable it under
`LuCI → Themes → luci-theme-c2` in `make menuconfig`.

## Select the theme

Installing registers `luci.themes.C2` and selects it automatically on first install. To change it
later:

- **Web UI**: System → System → Language and Style → **Design** → `C2`.
- **CLI**:
  ```sh
  uci set luci.main.mediaurlbase='/luci-static/c2'
  uci commit luci
  ```
  Then reload the LuCI page.

## Verify

```sh
# the theme files are present
ls /www/luci-static/c2/cascade.css /www/luci-static/resources/menu-c2.js

# the theme is registered / selected
uci get luci.themes.C2          # -> /luci-static/c2
uci get luci.main.mediaurlbase  # -> /luci-static/c2
```

Open LuCI and confirm the terminal styling, then toggle your OS light/dark mode to check both themes.

## Files installed

| Path | Purpose |
|---|---|
| `/www/luci-static/c2/cascade.css` | theme CSS (duotone tokens, light/dark) |
| `/www/luci-static/c2/logo.svg` | brand mark (`currentColor`) |
| `/www/luci-static/c2/favicon.svg` | adaptive tab icon |
| `/www/luci-static/c2/spinner.svg` | loading spinner |
| `/www/luci-static/resources/menu-c2.js` | client-side menu renderer |
| `/usr/share/ucode/luci/template/themes/c2/header.ut` | page header template |
| `/usr/share/ucode/luci/template/themes/c2/footer.ut` | page footer template |
| `/etc/uci-defaults/30_luci-theme-c2` | registers and selects the theme |

## Uninstall

```sh
# opkg
opkg remove luci-theme-c2

# apk
apk del luci-theme-c2
```

The package `postrm` removes `luci.themes.C2`; if you had selected C2, switch `luci.main.mediaurlbase`
back to another installed theme (or unset it) afterwards.
