---
layout: post
title: "Termux Clawd — The Pixel Phone"
date: 2026-03-02
---

# Termux Clawd — The Pixel Phone

An old Pixel 3 that's no longer a phone. It runs Termux — a Linux terminal emulator for Android — and sits on the network as a compute node with a camera, sensors, and a battery backup.

## Why a Phone?

Phones have things that SBCs don't: a camera, GPS, accelerometer, cellular modem, and a battery that keeps running when the power goes out. An old phone you'd otherwise recycle turns into a sensor platform and emergency compute node for basically zero cost.

## What's Running

**SSH server** — The primary interface. Everything else connects over SSH from other machines.

**OpenClaw node** — A distributed agent framework that connects back to NurseDroid's gateway. Clawdbot set this up so it could extend its reach to the phone. There's a limitation: Android doesn't support remote command execution through the framework without root, so SSH is the workaround.

**Battery monitoring** — A cron job every 5 minutes that alerts at 20% and 10%. Logs to a file for trend analysis.

**Screen capture** — Scheduled screenshots for visual monitoring. Each capture takes under 5 seconds and produces 2-3 MB images.

## Termux:API

The real power is Termux:API, which exposes Android hardware to the command line:

```bash
termux-battery-status      # Battery and charging state
termux-camera-photo        # Take a photo (front or back)
termux-location            # GPS coordinates
termux-wifi-connectioninfo # WiFi signal info
termux-torch on            # Flashlight
termux-notification        # Send Android notifications
termux-vibrate             # Haptic feedback
```

Scripts and agents can use the phone's sensors programmatically. Clawdbot already uses battery monitoring and screen capture.

## How It Got Set Up

Clawdbot handled this across several work sessions:

1. Installed the Termux SSH server and exchanged keys with NurseDroid
2. Enabled wireless ADB for deeper Android access
3. Deployed Node.js and the OpenClaw node module
4. Installed Termux:API and tested each sensor endpoint
5. Wrote the battery monitor and screen capture scripts
6. Set up cron for periodic tasks

Clawdbot also researched community projects for Termux: SMS gateways for 2FA routing, AdGuard Home for DNS-level ad blocking, WireGuard for VPN, and Tasker integration for event-driven automation. Most of these are on the "maybe later" list.

## Where It Fits

The phone fills a niche nothing else can:

- **Power outage sentinel** — When the power goes out, the phone keeps running on battery. Good candidate for alerting.
- **Mobile sensors** — Camera and GPS accessible to automation scripts.
- **Cellular fallback** — With a SIM, it could provide internet when the primary connection drops.
- **Low power** — Draws far less than any other device in the setup.

It's not replacing anything. It's extending the infrastructure into a form factor that goes places servers can't.

## Current State

Online, SSH accessible, battery monitor running, Termux:API available. Next up is possibly AdGuard Home for network-wide ad blocking, and using the camera for specific automation triggers.
