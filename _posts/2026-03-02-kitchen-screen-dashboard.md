---
layout: post
title: "Kitchen Screen — The Family Dashboard"
date: 2026-03-02
---

# Kitchen Screen — The Family Dashboard

The kitchen screen is a wall-mounted Raspberry Pi 5 running a custom touch-enabled kiosk dashboard. It shows three things at a glance: family photos, upcoming calendar events, and live camera feeds. The entire thing was built by an AI agent (Codex) in a single day session — including the debugging, the dead ends, and the pivots.

## The Hardware

A Raspberry Pi 5 Model B Rev 1.0, wall-mounted in the kitchen, running Debian 13 (Trixie) with a graphical Wayland session. The display is touch-capable, though most interaction is passive — the family glances at it while making coffee.

## The Three-Panel Layout

### 1. Photo Slideshow (Largest Panel)
- Photos sourced from Immich (the self-hosted photo platform running on NurseDroid)
- A sync pipeline runs every 5 minutes, pulling recent photos to local storage
- The slideshow cycles through photos with smooth transitions
- HEIC/HEIF photos are auto-converted with black-frame detection to catch corrupted conversions
- Photos render in full-image fit mode (no cropping) so faces don't get cut off

### 2. Calendar
- Connected to Google Calendar via OAuth 2.0
- Shows upcoming events for the household
- Calendar list is preloaded and selectable by tapping full rows (not just tiny checkboxes)

### 3. Camera Feeds (Compact Panel)
- Live MJPEG feeds from 2 security cameras via Home Assistant
- Each panel can be tapped to expand full-screen

## The Build Journey

This is where the story gets interesting. Here's what actually happened during the single-day Codex session that built this dashboard:

### Step 1: Finding the Pi on the Network

The agent started by scanning the local network to find the Raspberry Pi. It found a candidate by MAC vendor prefix, SSH-probed it, and initially couldn't authenticate. After several discovery passes (mDNS, SSH banners, hostname probes), the user pointed it to the correct IP.

The agent confirmed hardware identity by reading `/proc/device-tree/model` — `Raspberry Pi 5 Model B Rev 1.0`. Only then did it proceed.

### Step 2: Setting Up Kiosk Mode

The agent wrote a kiosk launcher script that starts Chromium in fullscreen app mode on boot, connected to the Pi's Wayland display session. Getting the right display socket (`wayland-0` vs `wayland-1`) caused a hiccup — the agent had to detect which socket was active and retry.

Key flags for headless kiosk Chromium: `--kiosk`, `--app=<url>`, `--password-store=basic` (to suppress the keychain unlock prompt that blocks unattended dashboards).

### Step 3: Building the Dashboard App

The architecture is deliberately simple:

- **Backend**: A Python API server running on the Pi (served on a local port). Handles camera proxying, photo index serving, and calendar data.
- **Frontend**: Vanilla HTML, CSS, and JavaScript. No framework, no build step.

This was a conscious choice — fewer dependencies means faster load times and easier debugging on a resource-constrained device.

### Step 4: The Google Calendar OAuth Saga

This was one of the trickier parts. The agent had to:

1. Copy the user's Google OAuth `client-secret.json` to the Pi (with `600` permissions)
2. Set up the OAuth 2.0 flow for a headless device (redirect to `localhost:8080`)
3. Use SSH port forwarding (`ssh -L 8080:127.0.0.1:8080`) so the user could complete the OAuth consent flow in their local browser
4. Handle token refresh for unattended operation

The first attempt failed because the redirect URI wasn't in the Google Console allowlist. The agent diagnosed the mismatch, explained the fix, and the OAuth flow completed on the second attempt. Calendar API returned `200 OK`.

### Step 5: The Google Photos Dead End

The agent initially tried to use the Google Photos Library API for the slideshow. It set up the OAuth scope, got a token, and... hit a wall. As of March 31, 2025, Google removed broad library access scopes (`photoslibrary.readonly`). The API now returns `403` even with a valid token.

The agent tried several alternatives:
- **Google Photos Picker API** — requires interactive user selection, not suitable for unattended sync
- **Syncthing** — installed and configured on the Pi, but pivoted away
- **rclone** — investigated but Google Photos isn't an rclone-addressable filesystem anymore

### Step 6: The Immich Pivot

The solution: use Immich (already running on NurseDroid) as the photo source. A sync script runs every 5 minutes:

```
Immich API (NurseDroid) → download new photos → local storage → slideshow rotation
```

Photos are cached locally so the slideshow reads from disk, not the network. This avoids latency and fragility.

### Step 7: Apple Photos Attempt

The user also wanted Apple Photos integration. The agent installed `icloudpd` (iCloud Photo Downloader), set up a systemd timer for automatic sync, and configured secure credential storage (`~/.config/fridge-dashboard/secrets/`, mode `600`).

The blocker: Apple's 2FA flow with passkeys. The agent tried console MFA, then web UI MFA (with SSH port forwarding to expose the auth page). Eventually the user completed 2FA from a trusted device, albums were listed, and the `KidArt` album was selected for sync.

### Step 8: Camera Proxy — Solving CORS

Cameras expose MJPEG streams, but loading them directly in a browser runs into CORS restrictions. The solution: a local Python proxy that fetches the camera streams server-side and re-serves them from the same origin.

The agent also implemented frame corruption detection — MJPEG streams occasionally deliver partial or garbled frames, and the validator catches these before they hit the display.

### Step 9: Photo Rendering Fixes

The initial photo display had issues:
- **HEIC black frames**: Some HEIC-to-JPEG conversions produced all-black images. The agent added a `is_near_black_image()` check using ImageMagick's mean/stddev analysis, with retry logic.
- **Cropped faces**: The default center-crop mode cut off people's heads. The agent switched to `object-fit: contain` — full image, no crop.
- **"No Photo" fallback**: Added a watermark-style overlay for when the slideshow has no images or an image fails to load.

## Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌───────────────┐
│   Immich         │────→│  Photo Sync  │────→│  Local Photos │
│   (NurseDroid)   │     │  (5 min)     │     │  (on Pi)      │
└─────────────────┘     └──────────────┘     └───────┬───────┘
                                                      │
┌─────────────────┐     ┌──────────────┐     ┌───────▼───────┐
│  Home Assistant  │────→│ Camera Proxy │────→│   Dashboard   │
│  (cameras)       │     │ (Python)     │     │   (Chromium   │
└─────────────────┘     └──────────────┘     │    Kiosk)     │
                                              └───────────────┘
┌─────────────────┐     ┌──────────────┐              │
│  Google Calendar │────→│  OAuth +     │──────────────┘
│  API             │     │  Token Mgmt  │
└─────────────────┘     └──────────────┘
```

## Current State

Fully operational. Two cameras are streaming live, calendar events update automatically, and the photo slideshow cycles through family photos from both Immich and iCloud. The household uses it daily — it's become the ambient information display for the kitchen.

---

*Next: [Setting Up a Kitchen Dashboard]({% post_url 2026-03-02-kitchen-screen-setup-guide %}) — How to build your own, with and without an AI agent.*
