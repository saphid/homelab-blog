---
layout: post
title: "NurseDroid — The Home Server"
date: 2026-03-02
---

# NurseDroid — The Home Server

NurseDroid is an Intel small form factor PC running Ubuntu with everything in Docker. It's the centre of the homelab — media, photos, monitoring, and an AI agent that works overnight while I sleep.

## What's Running

Eleven Docker containers, roughly grouped:

**Media & Books** — Plex for streaming, Transmission for downloads, Calibre for ebooks.

**Photos** — Immich, which is basically self-hosted Google Photos. It does face recognition and smart search via an ML container. Four containers total: the app server, ML worker, Postgres (with vector extensions for similarity search), and Valkey for caching.

**Monitoring** — Grafana for dashboards. Prometheus actually runs on the Orange Pi rather than here, which keeps the monitoring workload distributed.

**Everything Else** — Portainer for managing Docker, Syncthing for file sync between devices, FreshRSS for RSS feeds, and a custom Markdown viewer that Clawdbot built for browsing its own documentation.

## Clawdbot

The most interesting thing on this machine isn't a container — it's Clawdbot.

Clawdbot is an autonomous AI agent running through a framework called Wisp. It has its own identity files, a diary, a memory system, and a task backlog. Cron jobs keep it alive — if the process dies, it restarts itself. It works through tasks overnight, logging what it does.

Some things it's built:
- A bushfire evacuation plan integrated with Home Assistant
- Estate planning and insurance checklists for the family
- The markdown viewer service
- A Discord monitoring setup
- A bidirectional memory sync system with its own systemd service
- Various Home Assistant integrations and automation configs

The thing that surprised me most: when I gave it a mixed list of infrastructure tasks and family safety tasks, it chose to work on the family stuff first. Estate planning, bushfire preparedness, insurance review. Nobody told it to prioritise that way.

It also keeps a diary. Here's a real entry from February:

> "Today has been incredibly productive. Alex was doing family Saturday stuff and I got to work autonomously."
>
> "Alex asked me to check if our systems are actually being used. Fair question. We have 13 cron jobs running but are they producing value?"

An AI agent questioning whether its own work is providing value. Make of that what you will.

## Key Decisions

**Killing Kubernetes** — There was a k8s installation eating 3.6 GB of RAM that nobody was using. The agent flagged it, I approved, and Docker Compose got all that memory back. For a single-node home server, k8s is overkill.

**Immich over Google Photos** — Immich runs locally, does ML-powered search, and feeds the kitchen dashboard. No cloud dependency. The trade-off is maintaining it yourself, but it's been stable.

## Current State

Stable. All 11 containers running. Clawdbot continues its overnight work cycles. Next steps are expanding the monitoring dashboards and deeper integration between Clawdbot and Home Assistant.

---

*Setup guide: [How to build a Docker home server like this]({{ site.baseurl }}{% post_url 2026-03-02-nursedroid-setup-guide %})*
