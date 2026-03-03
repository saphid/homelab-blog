---
layout: home
title: "Home Infrastructure: What the AI Agents Built"
---

# Home Infrastructure: What the AI Agents Built

Over the past few months, a small fleet of AI coding agents — Claude Code, OpenAI Codex, and an autonomous agent called Clawdbot (running via a framework called Wisp) — have been quietly building, configuring, and maintaining a home infrastructure for a young family in Australia.

This blog series documents what they built, how they approached problems, and what the current state of each device looks like. Think of it as a device audit, written up for anyone curious about what happens when you give AI agents SSH access and a to-do list.

## Why Document This?

Home infrastructure has a way of growing organically. A media server here, a dashboard there, a smart home hub controlling the blinds. When AI agents are doing the building, the pace accelerates — but documentation often doesn't keep up.

These posts are an attempt to capture the snapshot: what's running, what was built by whom, and what's next. Each device has an overview post (what it is and how it got built) and a setup guide (how to reproduce it, with both agent-assisted and manual approaches).

## The Devices

| Device | Role | Status |
|--------|------|--------|
| [NurseDroid]({% post_url 2026-03-02-nursedroid-home-server %}) | Central home server (Docker-based) | Stable, 11 containers |
| [Kitchen Screen]({% post_url 2026-03-02-kitchen-screen-dashboard %}) | Wall-mounted family dashboard | Fully operational |
| [Orange Pi RV2]({% post_url 2026-03-02-orange-pi-edge-device %}) | Edge compute & monitoring node (RISC-V) | Online, monitoring stack active |
| [Termux Clawd]({% post_url 2026-03-02-termux-clawd-pixel-phone %}) | Pixel Phone compute node | Online, sensors available |
| [Home Assistant]({% post_url 2026-03-02-home-assistant-smart-home %}) | Smart home automation hub | Running, 264 sensors |

## Setup Guides

Each device also has a setup guide covering the agent-assisted approach and manual steps:

- [Setting Up a Docker Home Server]({% post_url 2026-03-02-nursedroid-setup-guide %})
- [Setting Up a Kitchen Dashboard]({% post_url 2026-03-02-kitchen-screen-setup-guide %})
- [Setting Up an Orange Pi RV2 Monitoring Node]({% post_url 2026-03-02-orange-pi-setup-guide %})
- [Setting Up Home Assistant Integrations]({% post_url 2026-03-02-home-assistant-setup-guide %})

## The AI Agent Ecosystem

Three main agents have been working across this infrastructure:

- **Claude Code** — Anthropic's CLI coding agent. Used interactively for planning, debugging, and infrastructure audits. Currently running this documentation effort.
- **Codex** — OpenAI's coding agent. Built the entire kitchen dashboard in a single-day session, handling everything from camera proxy engineering to OAuth flows. Also handled the Orange Pi eMMC migration.
- **Clawdbot / Wisp** — An autonomous agent framework running on the home server. Operates overnight, picks tasks from a backlog, syncs its own memory, and has self-resurrection capabilities via cron. Set up the Pixel Phone as a compute node. Notably prioritized family safety documentation over tech projects.

Each post dives into a specific device, what's running on it, what the agents built, and — importantly — the journey of building it: the dead ends, the pivots, and the decisions that shaped the result.
