#
# Copyright (C) 2026 luci-c2 contributors
#
# This is free software, licensed under the Apache License, Version 2.0 .
#

include $(TOPDIR)/rules.mk

LUCI_TITLE:=C2 Theme (monospace command-and-control)
LUCI_DEPENDS:=+luci-base

PKG_NAME:=luci-theme-c2
PKG_VERSION:=0.1.0
PKG_RELEASE:=1
PKG_LICENSE:=Apache-2.0
PKG_MAINTAINER:=luci-c2 maintainers <maintainers@example.invalid>

# Serve cascade.css as authored; skip csstidy so the terminal layout is predictable.
CONFIG_LUCI_CSSTIDY:=

define Package/luci-theme-c2/postrm
#!/bin/sh
[ -n "$${IPKG_INSTROOT}" ] || {
	uci -q delete luci.themes.C2
	uci commit luci
}
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
