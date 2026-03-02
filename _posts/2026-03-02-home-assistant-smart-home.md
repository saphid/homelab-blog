---
layout: post
title: "Home Assistant — The Smart Home Brain"
date: 2026-03-02
---

# Home Assistant — The Smart Home Brain

Home Assistant is the automation hub that ties the physical home together with the digital infrastructure. It's the most device-rich component of the setup, managing hundreds of sensors, lights, switches, and media players across the house.

## Scale

The numbers tell the story:

| Category | Count |
|----------|-------|
| Sensors | 264 |
| Lights | 23 |
| Covers / Blinds | 14 |
| Switches | 48 |
| Media Players | 17 |

This isn't a token smart home setup — it's a comprehensive system where most controllable devices in the house are integrated.

## Notable Integrations

### Climate Control
- **AC zone control** — Individual zones can be managed, allowing different temperatures in different rooms
- Temperature monitoring across the house feeds into automations

### Security & Awareness
- **Video doorbell** — Live feed and motion alerts
- **Security cameras** — Feeds are shared with the kitchen dashboard via a proxy (see the Kitchen Screen post)

### Household Utilities
- **Smart keg freezer** — Temperature-monitored beer keg setup (yes, really)
- **Bin reminder** — Automated reminders for which bins to put out on collection day
- **Cover/blind control** — 14 motorized blinds and covers, controllable by automation or voice

### Media
- **17 media players** — Distributed audio and video across the house, controllable through HA dashboards and automations

### Voice Assistant
- **Whisper** — Speech-to-text, running locally (no cloud dependency)
- **Piper** — Text-to-speech, also running locally
- Together they provide a fully local voice assistant pipeline — voice commands are processed on-device without sending audio to external servers

## What the AI Agents Built

### Camera API Integration

The AI agents built the bridge between Home Assistant's camera feeds and the kitchen dashboard. Home Assistant exposes camera streams via its API, but getting those streams to display reliably on the kitchen screen required:

- A proxy service to handle authentication and CORS
- Frame validation to catch corrupted MJPEG data
- Reconnection logic for when cameras temporarily drop

This integration is what makes the "camera panel" on the kitchen dashboard work.

### Bushfire Evacuation Plan

Given the Australian location, bushfire preparedness is a real concern. The AI agents created a bushfire evacuation plan with Home Assistant triggers:

- **Monitoring**: Temperature and wind speed sensors can trigger alerts when conditions become dangerous
- **Notification flow**: Alerts pushed to phones and the kitchen dashboard
- **Checklist automation**: A structured evacuation checklist that can be triggered and tracked through HA

This is another example of the autonomous agent (Clawdbot) prioritizing family safety over tech projects — it chose to build this before working on other infrastructure tasks.

### Planned Automations

Several automations are in the pipeline:

- **Morning routine scenes** — Coordinated light, blind, and media activation for the household's wake-up routine
- **Temperature/wind monitoring alerts** — Proactive notifications when weather conditions warrant attention
- **Enhanced safety automations** — Building on the bushfire evacuation framework with additional family safety triggers

## Architecture

Home Assistant runs as its own instance (not containerized on NurseDroid). It communicates with devices via:

- **Zigbee** — For most smart home devices (lights, sensors, switches)
- **WiFi** — For cameras, media players, and some switches
- **Local API** — For integration with other infrastructure components (like the kitchen dashboard)

The key architectural principle: **everything runs locally**. Voice processing, automations, camera feeds — none of it depends on external cloud services. If the internet goes down, the smart home keeps working.

## Current State

The system is stable and actively used daily. The main growth areas are:

- Expanding weather-based automations
- Building out morning/evening routine scenes
- Deeper integration between Home Assistant and the AI agent ecosystem (allowing agents to trigger or respond to home automations)
