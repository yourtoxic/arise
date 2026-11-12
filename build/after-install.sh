#!/bin/bash
# Make the Chromium sandbox helper usable after every install or upgrade
chown root:root /opt/ARISE/chrome-sandbox 2>/dev/null || true
chmod 4755 /opt/ARISE/chrome-sandbox 2>/dev/null || true
update-desktop-database -q 2>/dev/null || true
gtk-update-icon-cache -q -t -f /usr/share/icons/hicolor 2>/dev/null || true
exit 0
