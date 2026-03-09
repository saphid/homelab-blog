---
layout: post
title: "Setting Up a Kitchen Dashboard"
date: 2026-03-02
tags:
  - kitchen-screen
  - setup-guide
---

# Setting Up a Kitchen Dashboard

This guide covers the kitchen dashboard as it exists now, not just as it was first built. The current deployment is a Next.js plus TypeScript stack on a Raspberry Pi 5 with a separate API process and a kiosk watchdog.

## What You'll Need

- Raspberry Pi 5 with a wall-mounted display
- Raspberry Pi OS or Debian-based install
- Node 20+ and `pnpm`
- A photo source
- Google Calendar credentials if you want family calendar data
- Home Assistant if you want home summary and camera data

---

## The Agent Approach

The original build began as a fast Pi bootstrap. The current version is more structured.

### Current architecture

- `apps/web`: Next.js frontend
- `apps/api`: Fastify API
- `packages/shared`: shared schemas and DTOs
- `tests/e2e`: Playwright tests
- kiosk startup: `~/next-dashboard/run-kiosk.sh`
- kiosk watchdog: `~/next-dashboard/kiosk-watchdog.sh`

### What the earlier sessions still tell us

- a Pi 5 really was found and verified on the network
- kiosk mode and browser-launch details really did need iteration
- Google Calendar auth and photo sync were the painful parts
- the project evolved after that initial burst instead of staying frozen in its first form

## The Manual Approach

### 1. Set up the project

Create a project directory such as `~/next-dashboard`, install dependencies, and keep web and API concerns split.

```bash
mkdir -p ~/next-dashboard
cd ~/next-dashboard
pnpm install
pnpm build
```

### 2. Keep the browser client dumb

Do not put Home Assistant or Google credentials in the frontend. Expose only the data the display needs from your local API:

- `/api/home_summary`
- `/api/calendar`
- `/api/cameras`
- image or camera proxy routes as needed

### 3. Launch it under the compositor

The live Pi uses Labwc autostart with `lwrespawn`. The shape to copy is:

```bash
/usr/bin/lwrespawn "$HOME/next-dashboard/run-kiosk.sh" &
/usr/bin/lwrespawn "$HOME/next-dashboard/kiosk-watchdog.sh" &
```

### 4. Separate current app paths from legacy ones

If you evolve the dashboard over time, do not leave the old path documented as if it is still current. The audited system still has legacy `fridge-dashboard` logs and service names hanging around, but the active deployment is `next-dashboard`.

### 5. Test the API and kiosk locally

The current deployment is easy to spot-check:

```bash
curl http://127.0.0.1:3000
curl http://127.0.0.1:8126/api/home_summary
curl http://127.0.0.1:8126/api/calendar
curl http://127.0.0.1:8126/api/cameras
```

## Practical Lessons

- calendar and camera integrations are the durable part of the stack
- photo sync is where the operational mess tends to accumulate
- kiosk reliability matters more than framework purity
- once a dashboard becomes a household appliance, the watchdog and logs matter as much as the layout
