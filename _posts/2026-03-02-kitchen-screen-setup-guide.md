---
layout: post
title: "Setting Up a Kitchen Dashboard"
date: 2026-03-02
---

# Setting Up a Kitchen Dashboard

This guide covers how to build a wall-mounted family dashboard on a Raspberry Pi — both the AI-agent-assisted approach (how it was actually built) and the manual steps if you're doing it yourself.

## What You'll Need

- Raspberry Pi 5 (4GB+ RAM) with a touchscreen or wall-mounted display
- MicroSD card with Raspberry Pi OS or Debian
- A photo source (Immich, iCloud, or a local folder)
- Google Calendar (optional)
- Camera feeds via Home Assistant (optional)

---

## The Agent Approach

This is how Codex (OpenAI's coding agent) actually built it in a single session.

### What the Agent Did Autonomously

1. **Network discovery**: Scanned the LAN, identified the Pi by MAC vendor prefix, confirmed hardware via `/proc/device-tree/model`
2. **Kiosk setup**: Wrote a launcher script for Chromium in `--kiosk --app=<url>` mode, detected the correct Wayland display socket, added `--password-store=basic` to suppress keychain prompts
3. **Dashboard app**: Created a Python API server + vanilla HTML/CSS/JS frontend from scratch
4. **Camera proxy**: Built a Python MJPEG proxy to solve CORS, added frame corruption detection
5. **Photo pipeline**: Set up Immich API sync → local caching → slideshow, with HEIC conversion and black-frame detection
6. **Calendar OAuth**: Managed the full OAuth 2.0 flow including SSH port forwarding for the consent screen

### What Required Human Input

- Providing the correct SSH credentials and IP
- Completing the Google OAuth consent flow in a browser
- Completing Apple 2FA from a trusted device
- Layout preferences ("make photos bigger, cameras smaller")
- Deciding to pivot from Google Photos to Immich when the API proved unusable

### Lessons from the Agent Build

- **The agent tried things that didn't work** — Google Photos API, Syncthing, multiple Wayland display sockets. The value wasn't in getting it right first time; it was in rapidly iterating through alternatives.
- **Human judgment mattered for design decisions** — The agent could build any layout, but knowing what a family actually wants to see while making breakfast required human input.
- **Auth flows still need humans** — OAuth consent screens and 2FA codes can't be completed by agents. Plan for these as manual steps.

---

## The Manual Approach

If you're building this without an AI agent, here's the sequence.

### 1. Prepare the Pi

Flash Raspberry Pi OS (or Debian) to the SD card. Boot, connect to your network, and enable SSH. Set a static IP via your router's DHCP reservation.

```bash
# Verify your Pi model
cat /proc/device-tree/model

# Update packages
sudo apt update && sudo apt upgrade -y
```

### 2. Install Dependencies

```bash
sudo apt install -y chromium-browser python3-pip python3-venv \
    imagemagick libheif-examples
```

### 3. Create the Dashboard App

Create a project directory and set up a Python virtual environment:

```bash
mkdir -p ~/fridge-dashboard/photos
cd ~/fridge-dashboard
python3 -m venv .venv
source .venv/bin/activate
pip install flask requests
```

The minimum viable dashboard needs three files:

**`server.py`** — A Flask app that serves the frontend, proxies camera streams, and serves the photo index.

**`index.html`** — A three-panel layout (photos, calendar, cameras) using vanilla HTML/CSS/JS.

**`styles.css`** — Layout styling. Key CSS for the photo display:
```css
#slideImage {
    width: 100%;
    height: 100%;
    object-fit: contain; /* full image, no cropping */
}
```

### 4. Camera Proxy (if using Home Assistant cameras)

The critical piece: a proxy endpoint in your Flask app that fetches MJPEG streams server-side and re-serves them. This eliminates CORS issues entirely.

```python
# Simplified camera proxy concept
@app.route('/camera/<camera_id>')
def camera_proxy(camera_id):
    # Fetch stream from Home Assistant API
    # Re-serve as MJPEG from same origin
    pass
```

Add frame validation to catch corrupted MJPEG data — check for valid JPEG headers (`0xFFD8`) and complete frames (`0xFFD9`).

### 5. Photo Sync Pipeline

If using Immich:
```bash
# Create a sync script that runs via cron
# Calls Immich API → downloads to ~/fridge-dashboard/photos/
# Generates an index.json for the slideshow
# Converts HEIC to JPEG via ImageMagick
# Checks for black frames (mean pixel value near 0)
```

Schedule with cron or a systemd timer to run every 5 minutes.

If using iCloud:
```bash
pip install icloudpd
# Requires Apple ID + 2FA setup
# Use --mfa-provider webui for passkey-based accounts
```

### 6. Google Calendar Integration

1. Create an OAuth 2.0 client in Google Cloud Console (Desktop app type)
2. Download `client-secret.json` to the Pi
3. Write a token refresh script that handles the OAuth flow
4. Use SSH port forwarding for the initial consent: `ssh -L 8080:127.0.0.1:8080 pi@<your-pi>`

**Gotcha**: The redirect URI in your Google Console must exactly match `http://127.0.0.1:8080/`. A mismatch will silently fail.

### 7. Kiosk Mode

Create an autostart script:

```bash
#!/bin/bash
export WAYLAND_DISPLAY=wayland-0
export XDG_RUNTIME_DIR=/run/user/$(id -u)

# Start the API server
cd ~/fridge-dashboard
source .venv/bin/activate
python server.py &

# Wait for server to start
sleep 3

# Launch Chromium in kiosk mode
chromium-browser \
    --kiosk \
    --app=http://127.0.0.1:8125/index.html \
    --password-store=basic \
    --noerrdialogs \
    --disable-infobars
```

**Gotcha**: Check which Wayland socket is active (`ls /run/user/$(id -u)/wayland-*`). Using the wrong one means Chromium launches but is invisible.

### 8. Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Black screen on boot | Wrong `WAYLAND_DISPLAY` | Check active socket |
| Keychain prompt blocks kiosk | Missing `--password-store=basic` | Add the flag |
| Camera feeds blank | CORS blocking cross-origin streams | Use a server-side proxy |
| Photos all black | HEIC conversion failure | Install `libheif-examples`, add black-frame check |
| Faces cropped | CSS `object-fit: cover` | Switch to `object-fit: contain` |
| OAuth redirect fails | Mismatched URI in Google Console | Exact match required |
| Google Photos 403 | API access removed March 2025 | Use Immich or iCloud instead |
