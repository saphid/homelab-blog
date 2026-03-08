---
layout: post
title: "Home Assistant — The Smart Home Brain"
date: 2026-03-02
---

# Home Assistant — The Smart Home Brain

Home Assistant is the control plane for the house, but this page is now deliberately narrower than the older version. I re-checked the live API on March 8, 2026 and rewrote this around what I could actually verify.

## Verified Current State

The current entity count is 1,160. The main domains I verified were:

- 339 sensors
- 367 binary sensors
- 23 lights
- 14 covers
- 51 switches
- 10 media players
- 24 device trackers
- 3 cameras

That is enough to show the system is doing real household work. It is also enough to show that some of the older blog numbers had drifted and needed correction.

## What I Confirmed Live

### Android sensor bridge

The cleanest live integration is the Pixel 3 sensor bridge.

- A Termux API service on the phone exposes battery, Wi-Fi, system, volume, camera, and sensor data.
- NurseDroid runs a cron-based sync script that posts those values into Home Assistant state entities.
- A separate health check validates both the phone-side API and the resulting HA entities.

At audit time `sensor.android_battery` and the other Android helper entities were updating correctly.

### Kitchen screen integration

The kitchen screen is also still tied into Home Assistant.

- The current kitchen API returns a home summary from HA.
- Camera data for the kitchen screen is coming through HA-backed camera endpoints.
- The live kitchen API currently exposes multiple cameras and a weather-plus-people summary.

### Representative integrations

The live component list confirms a mixed local stack that includes representative integrations such as:

- ZHA
- Matter
- Reolink
- Tapo
- Shelly
- Meross LAN
- Ecowitt
- WLED
- Apple TV
- Meshcore device tracking

I am intentionally not pretending that this page is a full audit of every device and every automation. It is a verified summary of the integrations I could check without turning the blog into a raw HA dump.

## What Changed From The Older Story

The earlier draft mixed live fact with remembered setup lore. The biggest fixes were:

- media player count is lower than the old post claimed
- switch count is slightly higher
- the Android phone integration is not hypothetical anymore; it is a real live sync path
- some earlier feature claims were too broad to keep without a deeper subsystem-by-subsystem audit

## Current State

Home Assistant is live, large, and clearly central to the rest of the homelab. The most important verified edges right now are:

- Android phone to HA sensor sync
- HA camera and summary data feeding the kitchen screen
- local-first household control rather than cloud glue

---

*Setup guide: [How to set up HA integrations]({{ "/home-assistant-setup-guide/" | relative_url }})*
