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
| [NurseDroid]({% post_url 2026-03-02-nursedroid-home-server %}) | Docker home server — media, photos, monitoring | Stable, 11 containers |
| [Kitchen Screen]({% post_url 2026-03-02-kitchen-screen-dashboard %}) | Wall-mounted Raspberry Pi 5 dashboard | Fully running |
| [Orange Pi RV2]({% post_url 2026-03-02-orange-pi-edge-device %}) | RISC-V monitoring node | Online |
| [Termux Clawd]({% post_url 2026-03-02-termux-clawd-pixel-phone %}) | Repurposed Pixel phone | Online |
| [Home Assistant]({% post_url 2026-03-02-home-assistant-smart-home %}) | Smart home hub, 264 sensors | Running |
| [Pi 5 vs Orange Pi RV2]({% post_url 2026-03-02-pi5-vs-orangepi-rv2 %}) | Head-to-head comparison | Reference |

## Build Guides

I've written up how each device was set up — what the agent did, what I had to do manually, and what you'd need to know to build something similar:

- [Docker Home Server Guide]({% post_url 2026-03-02-nursedroid-setup-guide %})
- [Kitchen Dashboard Guide]({% post_url 2026-03-02-kitchen-screen-setup-guide %})
- [Orange Pi RV2 Monitoring Node Guide]({% post_url 2026-03-02-orange-pi-setup-guide %})
- [Home Assistant Integration Guide]({% post_url 2026-03-02-home-assistant-setup-guide %})

## The Agents

Three agents have been doing the work:

**Claude Code** — Anthropic's coding CLI. I use it interactively for debugging, planning, and audits. It's writing this documentation.

**Codex** — OpenAI's agent. Built the entire kitchen dashboard in a day. Also handled the Orange Pi's storage migration.

**Clawdbot** — An autonomous agent running overnight on NurseDroid via a framework called Wisp. It picks tasks from a backlog, keeps its own diary, and resurrects itself if it crashes. It decided on its own to prioritise family safety documentation over tech projects, which I thought was pretty interesting.

## Links

I also keep a [collection of interesting links](/homelab-blog/links.html) — stuff I've come across that's worth sharing.
