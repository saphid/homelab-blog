---
layout: post
title: "Kitchen Screen — The Family Dashboard"
date: 2026-03-02
---

# Kitchen Screen — The Family Dashboard

A Raspberry Pi 5 mounted on the kitchen wall, running a three-panel dashboard: family photos, calendar, and camera feeds. Codex built the whole thing in a single day session. Including all the debugging.

## What It Shows

**Photos** take up most of the screen. They sync from Immich every five minutes, get converted from HEIC if needed, and cycle through as a slideshow. There's black-frame detection so corrupted conversions don't show up as blank screens.

**Calendar** pulls from Google Calendar via OAuth. Shows what's on for the family today.

**Cameras** show live MJPEG feeds from two security cameras via Home Assistant, proxied through a local server to avoid CORS issues.

## How It Got Built

This is the interesting part. I pointed Codex at a fresh Pi 5 and said "build me a kitchen dashboard." Here's what actually happened:

**Finding the Pi** — The agent scanned my LAN, found a candidate by MAC address, tried to SSH in, and got the credentials wrong. After a few attempts and me pointing it to the right IP, it confirmed the hardware by reading `/proc/device-tree/model`.

**Kiosk mode** — It wrote a launch script for Chromium in fullscreen mode. Got tripped up by the Wayland display socket (`wayland-0` vs `wayland-1`) and had to retry. Added `--password-store=basic` to stop the keychain prompt from blocking the display.

**The app itself** — A Python Flask server on the Pi serving a vanilla HTML/CSS/JS frontend. No React, no build tools. For a Pi that just needs to display three panels, this was the right call.

**Google Calendar OAuth** — This took a while. The agent copied my OAuth credentials to the Pi, set up the redirect flow, and the first attempt failed because the redirect URI didn't match the Google Console config. SSH port forwarding (`ssh -L 8080:127.0.0.1:8080`) let me complete the consent flow in my browser. Worked on the second try.

**Google Photos — the dead end** — The agent tried the Photos Library API, got a token, and hit a `403`. Since March 2025, Google killed broad library access. It tried Syncthing, rclone, the Picker API — none of them work for unattended sync. This is where having an agent is useful: it burned through all the bad options fast.

**Immich to the rescue** — Pivoted to Immich, which was already running on NurseDroid. A sync script hits the Immich API every 5 minutes, downloads new photos, and the slideshow reads from local disk.

**Apple Photos** — Also set up `icloudpd` for iCloud photo sync. Getting past Apple's 2FA with passkeys was a saga involving web UI MFA, SSH port forwarding, and eventually just approving it from a trusted device. Now it syncs from a specific album.

**Camera proxy** — Cameras won't load in a browser directly (CORS). The agent built a Python proxy that fetches the MJPEG streams from Home Assistant and re-serves them from the same origin. Added frame corruption detection too — MJPEG streams occasionally deliver garbage, and the validator catches it.

**Photo rendering issues** — First version cropped faces off. Switched from `object-fit: cover` to `contain`. HEIC conversions sometimes produced all-black images — added an ImageMagick check for mean pixel brightness.

## Current State

Fully running. We glance at it every morning. Photos cycle, calendar shows what's on, cameras show the front door and another angle. The household genuinely uses it, which is the best metric I've got.

---

*Setup guide: [How to build your own kitchen dashboard]({{ "/kitchen-screen-setup-guide/" | relative_url }})*
