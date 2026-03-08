---
layout: post
title: "Termux Clawd — The Pixel Phone"
date: 2026-03-02
---

# Termux Clawd — The Pixel Phone

The Pixel phone is still one of the stranger parts of the setup, but the live audit made its role much clearer. It is not currently best described as a fully-general remote compute node. It is better described as an SSH-accessible Android sensor and Home Assistant bridge.

## Verified Current State

The device is a Pixel 3 running Android 12 and reachable over Termux SSH.

During the audit I confirmed:

- `sshd` is running
- `android-ha-api.py` is running
- `termux-sensor` sampling is active
- the local Android API responds for battery, Wi-Fi, system, and sensor endpoints

The phone also has:

- a `.ssh` directory
- a `clawd` working area
- an `.openclaw` directory
- screenshot and logs directories

## What It Actually Does Right Now

The strongest current use case is the Home Assistant bridge.

- the phone collects Android and sensor data locally
- NurseDroid polls it
- Home Assistant receives stable helper entities from that sync path

That is much more concrete than the older description of a broad OpenClaw node with lots of future possibilities.

## What I Am Not Claiming Anymore

The previous version overstated some things.

- I did not find live proof in this audit that the phone is currently operating as a full OpenClaw execution node.
- I did not find a device crontab driving lots of scheduled work on-phone.
- The useful operational logic seems to live mostly on NurseDroid, with the phone acting as the endpoint and sensor source.

That is still a good role. It is just a narrower and more accurate one.

## Why the Phone Still Earns Its Place

Even in this reduced role, an old phone has a few advantages:

- battery-backed runtime
- real Android sensors
- a camera
- low power draw
- a form factor that can stay attached to the network without asking for much

For this lab, that is enough.

## Current State

The Pixel node is live and useful. The interesting thing is not that it might someday do everything. The interesting thing is that it already does one practical job well: turning a spare Android device into a sensor-producing endpoint that the rest of the homelab can consume.
