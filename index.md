---
layout: home
title: Home
---

# My Homelab, Built by AI Agents

I've been running an experiment: giving AI coding agents access to my home infrastructure and seeing what they build. Over the past couple of months, Claude Code, Codex, and an autonomous agent called Clawdbot have been setting up servers, building dashboards, configuring monitoring, and even writing family safety plans — all while I go about my day job and family life.

This site documents what happened. Part infrastructure blog, part build log, part "what happens when you let AI loose on your network."

## The Setup

| Device | What It Does | Status |
|--------|-------------|--------|
| [NurseDroid]({{ "/nursedroid-home-server/" | relative_url }}) | Docker home server — media, photos, monitoring | Stable, 11 containers |
| [Kitchen Screen]({{ "/kitchen-screen-dashboard/" | relative_url }}) | Wall-mounted Raspberry Pi 5 dashboard | Fully running |
| [Orange Pi RV2]({{ "/orange-pi-edge-device/" | relative_url }}) | RISC-V monitoring node | Online |
| [Termux Clawd]({{ "/termux-clawd-pixel-phone/" | relative_url }}) | Repurposed Pixel phone | Online |
| [Home Assistant]({{ "/home-assistant-smart-home/" | relative_url }}) | Smart home hub, 264 sensors | Running |
| [Pi 5 vs Orange Pi RV2]({{ "/pi5-vs-orangepi-rv2/" | relative_url }}) | Head-to-head comparison | Reference |

## Build Guides

I've written up how each device was set up — what the agent did, what I had to do manually, and what you'd need to know to build something similar:

- [Docker Home Server Guide]({{ "/nursedroid-setup-guide/" | relative_url }})
- [Kitchen Dashboard Guide]({{ "/kitchen-screen-setup-guide/" | relative_url }})
- [Orange Pi RV2 Monitoring Node Guide]({{ "/orange-pi-setup-guide/" | relative_url }})
- [Home Assistant Integration Guide]({{ "/home-assistant-setup-guide/" | relative_url }})

## The Agents

Three agents have been doing the work:

**Claude Code** — Anthropic's coding CLI. I use it interactively for debugging, planning, and audits. It's writing this documentation.

**Codex** — OpenAI's agent. Built the entire kitchen dashboard in a day. Also handled the Orange Pi's storage migration.

**Clawdbot** — An autonomous agent running overnight on NurseDroid via a framework called Wisp. It picks tasks from a backlog, keeps its own diary, and resurrects itself if it crashes. It decided on its own to prioritise family safety documentation over tech projects, which I thought was pretty interesting.

## Links

I also keep a [collection of interesting links]({{ '/links.html' | relative_url }}) — stuff I've come across that's worth sharing.
