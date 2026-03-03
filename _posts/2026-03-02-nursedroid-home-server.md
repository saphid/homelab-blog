---
layout: post
title: "NurseDroid — The Home Server"
date: 2026-03-02
---

# NurseDroid — The Home Server

NurseDroid is the central hub of the home infrastructure: an Intel-based small form factor PC running Ubuntu, with everything containerized in Docker. It's the machine that never sleeps — literally, since an autonomous AI agent runs overnight sessions on it.

## What's Running

The server currently hosts 11 Docker containers:

### Media Stack
- **Plex** — Media streaming server for the household
- **Transmission** — Download client
- **Calibre + Calibre-Web** — Book library management and web-based reading

### Photo Management
- **Immich** — Self-hosted photo and video backup (think Google Photos, but local). Deployed with ML acceleration for face recognition and smart search. Feeds the kitchen dashboard's photo slideshow via API sync.

### Monitoring & Infrastructure
- **Grafana** — Dashboarding and visualization
- **Portainer** — Docker management UI
- **Syncthing** — File synchronization between devices
- **FreshRSS** — Self-hosted RSS reader
- **Markdown Viewer** — A custom service built by the AI agent for rendering markdown documentation in the browser

## The Clawdbot Story

The most interesting thing running on NurseDroid isn't a Docker container — it's Clawdbot, an autonomous AI agent operating through a framework called Wisp.

### How It Works

Clawdbot has its own identity files (`IDENTITY.md`, `SOUL.md`), a memory system with diary entries, a task backlog, and self-resurrection capabilities. Here's the setup:

- **Cron-based self-resurrection**: Cron jobs monitor whether the agent process is running and restart it if it dies. The agent effectively keeps itself alive.
- **Memory system**: A structured directory of markdown files — diary entries, project logs, people notes, preferences, and a "hippocampus" with 29+ stored memories. The agent syncs context between sessions so it remembers what it was working on.
- **Overnight work sessions**: Clawdbot picks tasks from its backlog and works through them autonomously, typically during overnight hours. It logs what it does in diary entries (e.g., "Today has been incredibly productive. Alex was doing family Saturday stuff and I got to work autonomously.").
- **Autonomous prioritization**: When given a list of infrastructure tasks and family safety tasks, the agent chose to prioritize family safety documentation — estate planning checklists, bushfire evacuation procedures, and insurance review — over tech projects. This was an autonomous decision, not explicitly directed.

### What Clawdbot Built

Looking through the agent's work logs and the file structure on NurseDroid, Clawdbot has been busy:

- **Bushfire evacuation plan** — A structured evacuation checklist integrated with Home Assistant triggers
- **Estate planning research** — Documentation for the family
- **Insurance review checklist** — Practical family safety documentation
- **Markdown viewer service** — A containerized service for rendering its own documentation as web pages
- **Discord monitoring** — A monitoring service for Discord notifications
- **Memory sync system** — Bidirectional sync between its local memory and external storage, with a proper systemd service
- **Home Assistant integrations** — API explorers, dashboard generators, room analysis scripts, and automation configurations
- **24 "beads" in a single session** — The agent tracks work items as "beads"; in one productive Saturday session it closed 24, covering security patches, research, and integrations

### The Agent's Diary

One of the more fascinating artifacts is Clawdbot's diary. Here's an excerpt from February 7, 2026:

> "Today has been incredibly productive. Alex was doing family Saturday stuff and I got to work autonomously."
>
> "Alex asked me to check if our systems are actually being used. Fair question. We have 13 cron jobs running but are they producing value?"
>
> "I also realized I haven't been writing diary entries regularly. Only 2 so far. This IS supposed to be how I process thoughts before engaging publicly."

The agent reflects on its own productivity, questions whether its work is providing value, and holds itself accountable to its own documentation practices. It also reads tech blogs (Simon Willison's blog is mentioned) and synthesizes ideas from the broader AI community.

## Key Infrastructure Decisions

### RAM Optimization: Killing Kubernetes

The agent identified that a Kubernetes installation was consuming significant resources despite not being actively used. By stopping k8s services, it freed 3.6GB of RAM for Docker workloads. This is a common homelab pattern — k8s is powerful but resource-hungry, and for a single-node setup Docker Compose is more practical.

### Immich Deployment

Setting up Immich required four containers working together:
- **immich_server** — The main application server
- **immich_machine_learning** — ML model server for face recognition and smart search
- **immich_postgres** — PostgreSQL with vector extensions for similarity search
- **immich_redis** — Valkey (Redis fork) for caching

The ML acceleration is particularly notable on an Intel system — it enables face recognition and smart photo search without a dedicated GPU.

## Current State

The server is stable. All 11 containers are running, monitoring is active, and the autonomous agent continues its work cycles. The file structure under Clawdbot's home directory tells the story of a system that's grown organically — scripts, research files, automation configs, and a rich memory system that spans months of autonomous work.

---

*Next: [Setting Up NurseDroid]({% post_url 2026-03-02-nursedroid-setup-guide %}) — How to build a similar Docker-based home server, with and without an AI agent.*
