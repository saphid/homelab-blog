---
layout: post
title: "Kitchen Screen — The Family Dashboard"
date: 2026-03-02
tags:
  - kitchen-screen
  - home-assistant
  - deployment
---

# Kitchen Screen — The Family Dashboard

The kitchen screen started as a one-session Pi build story, but that is no longer the right way to describe it. The original `fridge-dashboard` build happened. The current deployment is a newer system.

## Verified Current State

The host is a Raspberry Pi 5. The active app path is `~/next-dashboard`, not the older `~/fridge-dashboard` path from the first round of sessions.

The live implementation is:

- a Next.js web app on port `3000`
- a TypeScript Fastify API on port `8126`
- a Labwc autostart path that launches `run-kiosk.sh` and `kiosk-watchdog.sh`

During the audit, these endpoints responded successfully:

- `/api/home_summary`
- `/api/calendar`
- `/api/cameras`

That means the kitchen screen is actively pulling weather, people, calendar, and camera data into the display stack right now.

## What Changed Since The First Build

The historical sessions still matter, but they are no longer the whole story.

- The first version really was a simpler `fridge-dashboard` app.
- The current deployment has moved to a monorepo with stronger typing, shared DTOs, unit tests, and Playwright tests.
- The older `fridge-*` service names and log directories still exist, which is useful context but no longer the right place to point a newcomer.

## What It Actually Does

The kitchen screen is still the family-facing control surface in the lab. The live data path shows:

- calendar data
- HA-backed home summary data
- HA camera feeds through server-side routes
- local kiosk launch and watchdog behavior

The photo side is the messier part of the system history. The logs and service names show multiple sync paths over time: Immich, Apple Photos, and older `fridge-dashboard` components. That is exactly the kind of reality the earlier blog drafts smoothed over too much.

## Why The Current Version Is Better

The new writeup is less cinematic and more useful:

- it points to the active app path
- it names the actual runtime stack
- it leaves the old build story in place, but as history rather than as the present

## Current State

The kitchen screen is live and clearly in use as a real household display. The strongest current evidence is not the story of the first build session. It is the fact that the Pi is still serving the current dashboard, current API, and current kiosk processes today.

---

*Setup guide: [How to build your own kitchen dashboard]({{ "/kitchen-screen-setup-guide/" | relative_url }})*
