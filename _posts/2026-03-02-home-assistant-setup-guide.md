---
layout: post
title: "Setting Up Home Assistant Integrations"
date: 2026-03-02
---

# Setting Up Home Assistant Integrations

This guide covers the Home Assistant integrations built by AI agents — particularly the camera-to-dashboard bridge and the bushfire evacuation automation — and how to set them up yourself.

## Prerequisites

- Home Assistant running (HAOS, Docker, or supervised install)
- Camera integrations configured in HA
- Network access from other devices to HA's API

---

## The Agent Approach

The AI agents worked on Home Assistant from two directions: Codex built the camera integration for the kitchen dashboard, and Clawdbot built the family safety automations.

### Camera API Integration (Codex)

The challenge: get live camera feeds from Home Assistant into a browser-based dashboard on a different device.

What the agent did:
1. **Discovered the HA API** — found that HA exposes camera streams via its REST API with long-lived access tokens
2. **Built a proxy** — since the dashboard browser can't authenticate directly to HA (CORS + auth), the agent built a Python server-side proxy that authenticates to HA and re-serves the MJPEG stream
3. **Added frame validation** — MJPEG streams from some cameras deliver corrupted frames; the proxy validates JPEG headers before forwarding
4. **Handled reconnection** — cameras occasionally drop; the proxy reconnects automatically

### Family Safety Automations (Clawdbot)

Clawdbot autonomously prioritized these over tech projects:

1. **Bushfire evacuation plan** — A structured checklist with HA triggers based on temperature and wind speed sensors
2. **Notification flow** — Alerts pushed to phones and the kitchen dashboard
3. **Planned automations** — Morning routine scenes, weather monitoring alerts

### What Required Human Input

- Providing a long-lived access token for the HA API
- Camera entity IDs (which cameras to expose)
- Automation trigger thresholds (what temperature/wind speed is dangerous)
- Family-specific evacuation procedures

---

## The Manual Approach

### 1. Exposing Camera Feeds to Other Devices

Home Assistant cameras are accessible via the API:

```
GET /api/camera_proxy_stream/<entity_id>
Authorization: Bearer <long-lived-token>
```

To get a long-lived token: HA → Profile → Long-Lived Access Tokens → Create Token.

**The CORS problem**: If you try to load this directly in an `<img>` tag on another device, the browser blocks it (different origin). You need a proxy.

### 2. Building a Camera Proxy

A minimal Python proxy (Flask example):

```python
import requests
from flask import Flask, Response

app = Flask(__name__)

HA_URL = "http://homeassistant.local"
HA_TOKEN = "your-long-lived-token"

@app.route('/camera/<entity_id>')
def proxy(entity_id):
    url = f"{HA_URL}/api/camera_proxy_stream/{entity_id}"
    headers = {"Authorization": f"Bearer {HA_TOKEN}"}

    def generate():
        with requests.get(url, headers=headers, stream=True) as r:
            for chunk in r.iter_content(chunk_size=1024):
                yield chunk

    return Response(generate(), content_type='multipart/x-mixed-replace; boundary=frame')
```

Add frame validation by checking for JPEG markers (`FFD8` start, `FFD9` end) in each chunk before yielding.

### 3. Voice Assistant (Local, No Cloud)

Home Assistant supports fully local voice processing:

- **Whisper** — Speech-to-text (install via HA Add-ons)
- **Piper** — Text-to-speech (install via HA Add-ons)

Setup:
1. Install both add-ons from the HA Add-on Store
2. Configure a voice assistant pipeline: Settings → Voice assistants → Add assistant
3. Select Whisper for STT and Piper for TTS
4. Assign to an ESPHome voice satellite or use HA's mobile app

No audio leaves your network.

### 4. Weather-Based Safety Automations

For bushfire-prone areas, temperature and wind monitoring can trigger alerts:

```yaml
automation:
  - alias: "High Fire Danger Alert"
    trigger:
      - platform: numeric_state
        entity_id: sensor.outdoor_temperature
        above: 38
    condition:
      - condition: numeric_state
        entity_id: sensor.wind_speed
        above: 40
    action:
      - service: notify.mobile_app
        data:
          title: "Fire Danger Warning"
          message: "Temperature and wind conditions are elevated. Review evacuation checklist."
      - service: persistent_notification.create
        data:
          title: "Fire Danger Warning"
          message: "High temperature and wind detected. Check conditions."
```

### 5. Morning Routine Scenes

Coordinate lights, blinds, and media for the household wake-up:

```yaml
scene:
  - name: "Morning Routine"
    entities:
      light.kitchen:
        state: "on"
        brightness: 200
      cover.living_room_blinds:
        state: "open"
      media_player.kitchen_speaker:
        state: "playing"
```

Trigger via time-based automation or voice command.

### 6. Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Camera feed blank in dashboard | CORS blocking | Use a server-side proxy |
| Camera stream drops | Network hiccup | Add reconnection logic in proxy |
| Token expired | Long-lived tokens don't expire, but can be revoked | Check token is still valid in HA profile |
| Voice assistant not responding | Whisper/Piper not configured | Check pipeline settings |
| Automation not firing | Trigger conditions too narrow | Test with `Developer Tools → States` |
