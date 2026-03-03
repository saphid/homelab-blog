---
layout: post
title: "Termux Clawd — The Pixel Phone Compute Node"
date: 2026-03-02
---

# Termux Clawd — The Pixel Phone Compute Node

A Pixel 3 smartphone, repurposed as a network-connected compute node running Termux. It's the most unconventional piece of the infrastructure — a phone that's no longer a phone, but a Linux box with a camera, sensors, a battery backup, and cellular connectivity.

## What Is Termux?

Termux is a terminal emulator and Linux environment for Android. It provides a real Linux shell (no root required) with access to package managers, SSH, Python, Node.js, and more. On a Pixel phone, this turns a device most people would recycle into a surprisingly capable compute node.

## What's Running

### SSH Access

The phone runs an SSH server on Termux, accessible from any device on the local network. This is the primary way agents and scripts interact with it — everything else is built on top of this SSH connection.

### OpenClaw Node

The phone runs an OpenClaw node — a distributed agent framework that connects back to a gateway on NurseDroid. This was set up by Clawdbot to extend the agent's reach to a mobile device. The node:

- Connects to the gateway and maintains presence
- Exposes device capabilities (browser, system)
- Runs under the Termux user with Node.js

**The limitation**: The Android node doesn't support `system.run` (remote command execution) without a companion app or root access. So the node can report its presence and respond to queries, but can't be remotely driven to execute arbitrary commands through the framework. SSH remains the workaround for that.

### Termux:API — Phone Sensors as Infrastructure

The most interesting capability is Termux:API, which exposes Android hardware to the command line:

```bash
termux-battery-status     # Battery level, charging state
termux-camera-photo       # Take photos (front or back camera)
termux-location           # GPS coordinates
termux-wifi-connectioninfo # WiFi signal and SSID
termux-torch on           # Flashlight control
termux-notification       # Send Android notifications
termux-vibrate            # Haptic feedback
termux-clipboard-get/set  # Clipboard access
```

This means scripts and agents can use the phone's camera, GPS, and sensors programmatically.

### Battery Monitoring

Clawdbot set up a cron-based battery monitor:
- Runs every 5 minutes
- Alerts at 20% (warning) and 10% (critical)
- Sends notifications with a 10-minute cooldown to avoid spamming
- Logs to a local file for trend analysis

### Screen Capture Automation

Scheduled screen captures for visual monitoring and documentation — screenshots are auto-saved with timestamps and can be pulled to other machines. Each capture takes under 5 seconds and produces 1.7–3.5MB images.

## The Setup Journey

### How Clawdbot Set It Up

Clawdbot (the autonomous agent running on NurseDroid) handled the Pixel setup across several work sessions:

1. **SSH establishment**: Installed and configured the Termux SSH server, exchanged keys with NurseDroid for passwordless access
2. **Wireless ADB**: Enabled ADB over WiFi for deeper Android system access alongside SSH
3. **Node.js deployment**: Installed Node.js via Termux's package manager, then deployed the OpenClaw node module
4. **Termux:API integration**: Installed the Termux:API app and package, tested each sensor endpoint
5. **Automation scripts**: Created battery monitoring, screen capture, and other utility scripts
6. **Cron scheduling**: Set up periodic tasks for monitoring and maintenance

### What the Agent Researched

Clawdbot also researched what else the Pixel could do, documenting ideas from the community:
- **SMS gateway** — Receive SMS and publish to MQTT (useful for 2FA or IoT notifications)
- **Local web server** — Host lightweight APIs or static sites directly on the phone
- **AdGuard Home** — DNS-level ad blocking for the whole network (runs in Docker on Termux)
- **WireGuard VPN client** — Secure connectivity from anywhere
- **Tasker integration** — Monitor system events and trigger Termux scripts

### Recommended Services

The agent evaluated services by power efficiency (important since the Pixel has a limited battery):

| Service | Power Cost | Use Case |
|---------|-----------|----------|
| WireGuard VPN | ~80mA active | Secure remote access |
| AdGuard Home | ~30mA idle | Network-wide DNS filtering |
| Battery monitor | Negligible | Alert on low charge |
| SSH server | ~10mA idle | Remote access for agents |

## Architecture Role

The Pixel fills a unique niche in the infrastructure:

- **Mobile sensors**: Camera, GPS, and accelerometer accessible to automation scripts
- **Battery backup**: If the power goes out, the Pixel keeps running on its battery — making it a natural candidate for alerting and monitoring during outages
- **Cellular fallback**: With a SIM card, it could provide internet connectivity when the primary connection is down
- **Low power**: Draws far less than any other compute node in the setup

It's not replacing the server or the SBCs — it's extending infrastructure into a form factor that goes where traditional computers can't.

## Current State

The Pixel is on the network with SSH access, the OpenClaw node running, battery monitoring active, and Termux:API available. The main growth areas are:

- Deploying AdGuard Home for network-wide DNS filtering
- Setting up the SMS gateway for notification routing
- Using the camera for specific automation triggers (e.g., package delivery detection)
- Establishing it as a monitoring sentinel during power outages
