---
layout: post
title: "Kitchen Screen — The Family Dashboard"
date: 2026-03-02
---

# Kitchen Screen — The Family Dashboard

The kitchen screen is a wall-mounted Raspberry Pi 5 running a custom touch-enabled kiosk dashboard. It shows three things at a glance: family photos, upcoming calendar events, and live camera feeds. The entire thing was built by an AI agent (Codex) in a single day session.

## The Hardware

A Raspberry Pi 5 mounted on the kitchen wall, running in kiosk mode — a fullscreen browser with no desktop environment, auto-starting on boot. The display is touch-capable, though most interaction is passive (the family glances at it while making coffee).

## The Three-Panel Layout

### 1. Photo Slideshow
- Photos sourced from Immich (the self-hosted photo platform running on NurseDroid)
- A sync pipeline runs every 5 minutes, pulling recent photos to local storage
- The slideshow cycles through photos with smooth transitions
- No cloud dependency — everything stays on the local network

### 2. Calendar
- Connected to Google Calendar via OAuth
- Shows upcoming events for the household
- The OAuth token refresh was one of the trickier engineering challenges — the agent had to handle the full OAuth 2.0 flow for a headless device

### 3. Camera Feeds
- Live feeds from 2 security cameras
- Feeds come from Home Assistant's camera integration, proxied through a local API server

## The Engineering

### Camera Proxy — Solving CORS

The most interesting engineering problem was getting camera feeds to display in the browser. Cameras expose MJPEG streams, but loading them directly in an iframe or img tag runs into CORS (Cross-Origin Resource Sharing) restrictions — the browser blocks requests to different origins.

The solution: a local Python proxy server that fetches the camera streams server-side and re-serves them to the browser from the same origin. This eliminated CORS issues entirely.

### Frame Corruption Detection

Camera MJPEG streams occasionally deliver corrupted frames — partial images, garbled data. The agent implemented frame validation that detects corrupted frames and skips them rather than displaying visual artifacts on the dashboard.

### Architecture

The system is split into two parts:

- **Backend**: A Python API server running locally on the Pi. It handles camera proxying, photo sync from Immich, and calendar data fetching.
- **Frontend**: Vanilla HTML, CSS, and JavaScript. No framework, no build step. The browser hits the local API server for data and renders the three panels.

This architecture was a deliberate choice — keeping the frontend simple means fewer dependencies, faster load times, and easier debugging on a resource-constrained device.

### Photo Sync Pipeline

```
Immich (NurseDroid) → API call every 5 min → Download to local storage → Slideshow rotation
```

The pipeline avoids loading photos directly from the network on each rotation, which would be slow and fragile. Instead, photos are cached locally and the slideshow reads from disk.

## Built in a Day

The remarkable thing about this dashboard is that it was built from scratch in a single day by Codex. The agent handled:
- Setting up the Pi's kiosk mode
- Writing the Python API server
- Implementing the OAuth flow for Google Calendar
- Building the camera proxy with corruption detection
- Creating the frontend layout
- Configuring the Immich photo sync pipeline

## Current State

Fully operational. Two cameras are streaming live, calendar events update automatically, and the photo slideshow cycles through family photos. The household uses it daily — it's become the ambient information display for the kitchen.
