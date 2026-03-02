---
layout: post
title: "NurseDroid — The Home Server"
date: 2026-03-02
---

# NurseDroid — The Home Server

NurseDroid is the central hub of the home infrastructure: an Intel-based small form factor PC running Ubuntu, with everything containerized in Docker. It's the machine that never sleeps — literally, since an autonomous AI agent runs overnight sessions on it.

## What's Running

The server hosts 11 Docker containers spanning several categories:

### Media Stack
- **Plex** — Media streaming server for the household
- **Sonarr, Radarr, Prowlarr, Bazarr** — The *arr suite for media management and automation
- **Calibre + Calibre-Web** — Book library management and web-based reading

### Photo Management
- **Immich** — Self-hosted photo and video backup (think Google Photos, but local)
- Deployed with ML acceleration for face recognition and smart search
- Feeds the kitchen dashboard's photo slideshow via API sync

### Monitoring
- **Grafana** — Dashboarding and visualization
- **Prometheus** — Metrics collection
- **Loki** — Log aggregation
- Together these provide observability across the infrastructure

### Other Services
- **FreshRSS** — Self-hosted RSS reader
- **Markdown Viewer** — A custom service built by the AI agent for rendering markdown documentation in the browser

## What the AI Agents Built

### Clawdbot / Wisp — The Autonomous Agent

The most interesting thing running on NurseDroid isn't a Docker container — it's Clawdbot, an autonomous AI agent operating through a framework called Wisp. Here's how it works:

- **Self-resurrection**: Cron jobs monitor whether the agent is running and restart it if it dies. The agent effectively keeps itself alive.
- **Memory sync**: The agent maintains its own memory files, syncing context between sessions so it remembers what it was working on.
- **Overnight sessions**: Clawdbot picks tasks from a backlog and works through them autonomously, typically during overnight hours.
- **Task prioritization**: When given a list of infrastructure tasks and family safety tasks, the agent chose to prioritize family safety documentation — estate planning checklists, bushfire evacuation procedures, and insurance review — over tech projects. This was an autonomous decision, not explicitly directed.

### Key Projects

- **RAM optimization**: The agent identified that a Kubernetes installation was consuming significant resources despite not being actively used. By stopping k8s services, it freed 3.6GB of RAM for Docker workloads.
- **Immich deployment**: Set up the photo management platform with ML acceleration enabled, configured to work with the household's photo library.
- **Markdown viewer service**: Built a containerized service for rendering markdown files as web pages, used for browsing documentation on the local network.
- **Family safety documentation**: Created structured documents covering estate planning considerations, bushfire evacuation plans (relevant for the Australian location), and insurance review checklists.

## Current State

The server is stable. All 11 containers are running, monitoring is active, and the autonomous agent continues its work cycles. The main areas of growth are:

- Expanding monitoring dashboards
- Additional automation between services
- Continued work on family safety projects by the autonomous agent
