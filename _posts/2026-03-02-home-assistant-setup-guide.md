---
layout: post
title: "Setting Up Home Assistant Integrations"
date: 2026-03-02
tags:
  - home-assistant
  - pixel-termux
  - kitchen-screen
  - setup-guide
---

# Setting Up Home Assistant Integrations

This guide covers the Home Assistant integrations I could actually verify during the March 8, 2026 audit. The two solid paths are:

- the Android Termux phone sensor bridge
- the kitchen screen camera and summary integration

## Prerequisites

- Home Assistant running on your LAN
- A long-lived access token for the API
- One client machine that can reach HA and the other device you are integrating
- For the Android path: a Termux phone node with HTTP endpoints available locally

---

## The Agent Approach

The useful thing the agents did here was not magic. They stitched together a few boring but important pieces: token handling, periodic sync, and health checks.

### 1. Android sensor bridge

The current live flow is:

1. `android-ha-api.py` runs on the Pixel in Termux
2. NurseDroid polls that API
3. `android-ha-state-sync.py` pushes the values into Home Assistant state entities
4. `android-ha-stack-health-check.sh` validates the whole chain

The sync is scheduled from cron on NurseDroid, not from a device-local cron on the phone.

### 2. Kitchen screen bridge

The kitchen screen does not talk to HA directly from the browser. The current deployment exposes API routes on the Pi that fetch calendar, home summary, and camera data server-side and then hand a same-origin response to the frontend.

That matters because it avoids browser auth headaches and keeps tokens off the client.

### What still needed human input

- generating the long-lived token
- choosing which entities should be exposed downstream
- deciding which sensor values are worth keeping as permanent HA entities

---

## The Manual Approach

### 1. Generate a long-lived token

In Home Assistant:

- open your profile
- create a long-lived access token
- store it somewhere local and boring, not in source control

### 2. Expose Android device state

On the phone, run an API service that can return small JSON payloads for:

- battery
- Wi-Fi
- system metadata
- sensors
- volume
- camera summary

The audited setup uses a local HTTP service and leaves orchestration to NurseDroid.

### 3. Poll and push into Home Assistant

The actual sync shape is:

```python
import requests

ANDROID_API = "http://android-bridge:8080"
HA_BASE = "http://home-assistant:8123"

def fetch(path):
    return requests.get(f"{ANDROID_API}/{path}", timeout=15).json()

def push_state(headers, entity_id, state, attributes=None):
    payload = {"state": str(state), "attributes": attributes or {}}
    requests.post(
        f"{HA_BASE}/api/states/{entity_id}",
        headers=headers,
        json=payload,
        timeout=12,
    ).raise_for_status()
```

The key idea is simple: normalize the Android payload on the host that does the polling, then push stable helper entities into HA.

### 4. Add health checks

This part matters more than the initial sync script. The audited stack checks:

- the phone API endpoints
- the freshness of the sync log
- the presence of representative HA entities like `sensor.android_battery`

That stops the integration from silently decaying.

### 5. Put HA behind a server-side app boundary for dashboards

If another UI needs camera or summary data, prefer a small server-side bridge rather than putting HA tokens in the browser.

The current kitchen screen stack exposes API routes such as:

- `/api/home_summary`
- `/api/calendar`
- `/api/cameras`
- `/api/camera_proxy/:entity`
- `/api/camera_proxy_stream/:entity`

## Validation Checklist

After setup, verify:

1. The phone-side API responds locally.
2. The sync host can poll that API.
3. Home Assistant receives updated state entities.
4. A dependent UI can consume the resulting summary or camera routes.

If any of those fail, fix the broken edge instead of adding another layer of glue.

## Example Cron Shape

The audited NurseDroid setup uses a schedule like this:

```cron
*/5 * * * * /usr/bin/python3 /home/saphid/clawd/scripts/android-ha-state-sync.py >> /home/saphid/clawd/logs/android-ha-state-sync.log 2>&1
*/15 * * * * /home/saphid/clawd/scripts/android-ha-stack-health-check.sh >> /home/saphid/clawd/logs/android-ha-stack-health-check.log 2>&1
```

## What I Removed From The Older Version

The earlier draft gave more space to partially-documented family-safety automations than to the integrations I could actually verify. This version keeps the guide focused on the paths that are clearly live.
