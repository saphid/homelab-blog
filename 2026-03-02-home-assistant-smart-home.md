---
layout: post
title: "Home Assistant — The Smart Home Brain"
date: 2026-03-02
---

# Home Assistant — The Smart Home Brain

Home Assistant runs the physical house. Lights, blinds, cameras, climate control, media players, a smart keg freezer, and a bin reminder. It's not a toy setup — there are 264 sensors, 23 lights, 14 covers, 48 switches, and 17 media players. Everything runs locally, no cloud required.

## What It Controls

**Climate** — AC zone control across the house. Individual rooms can be set to different temperatures, and temperature sensors feed into automations.

**Security** — Video doorbell with live feeds and motion alerts. Two security cameras that stream to the kitchen dashboard via a proxy.

**Blinds** — 14 motorised covers and blinds, controllable by automation, schedule, or voice.

**Media** — 17 media players distributed around the house. Music and video controllable from HA dashboards.

**Household** — A smart keg freezer (temperature-monitored beer keg, because why not), and bin reminders that tell us which bins go out on collection day.

**Voice** — A fully local voice assistant stack: Whisper for speech-to-text and Piper for text-to-speech. No audio leaves the network. I'm running both as HA add-ons.

## What the Agents Built

### Camera Integration

The bridge between HA cameras and the kitchen dashboard was an agent project. HA exposes camera streams via its API, but getting MJPEG feeds to display in a browser on a different device means dealing with CORS and authentication. Codex built a Python proxy that authenticates to HA server-side and re-serves the streams. It also validates MJPEG frames and handles reconnection when cameras drop.

### Bushfire Safety

We live in Australia, so bushfire preparedness is real. Clawdbot built a structured evacuation plan with HA triggers:

- Temperature and wind speed sensors trigger alerts when conditions get dangerous
- Notifications go to phones and the kitchen dashboard
- A checklist automation tracks evacuation steps

This was something Clawdbot chose to build on its own — it prioritised family safety over the tech projects I'd listed.

### Planned Automations

Still on the to-do list:
- Morning routine scenes (coordinated lights, blinds, and media for wake-up)
- Weather monitoring alerts for temperature and wind
- More family safety triggers building on the bushfire framework

## Architecture

HA runs on its own instance (not on NurseDroid). Devices connect via Zigbee (most sensors, lights, switches), WiFi (cameras, media players), and the local API (for integration with other infrastructure like the kitchen dashboard).

The key principle: everything runs locally. Voice commands, automations, camera feeds — if the internet goes down, the house still works.

## Current State

Running and actively used daily. The main growth areas are weather-based automations, routine scenes, and deeper integration with the AI agents — potentially letting Clawdbot trigger or respond to home events.

---

*Setup guide: [How to set up HA integrations]({{ site.baseurl }}{% post_url 2026-03-02-home-assistant-setup-guide %})*
