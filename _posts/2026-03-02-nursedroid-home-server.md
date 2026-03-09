---
layout: post
title: "NurseDroid — The Home Server"
date: 2026-03-02
tags:
  - nursedroid
  - deployment
  - observability
---

# NurseDroid — The Home Server

NurseDroid is still the center of the homelab, but the cleaner thing to say is this: it is the mixed-use box where the media services, sync services, helper apps, and Clawd automation glue live.

## Verified Current State

At audit time, NurseDroid was running 12 Docker containers:

- `immich_importer`
- `immich_machine_learning`
- `immich_server`
- `immich_postgres`
- `immich_redis`
- `network-grafana`
- `markdown-viewer`
- `syncthing`
- `portainer`
- `freshrss`
- `calibre`
- `transmission`

That list already fixes one older drift: the previous blog version said 11 containers and described a simpler service mix than the machine is actually running today.

## What Lives Here

### Photos

Immich is here, including its ML worker, Postgres, Valkey, and importer path. That makes NurseDroid the practical photo hub for the rest of the system, including the kitchen screen.

### Utility services

The host is also carrying the small but important services:

- Portainer
- Syncthing
- FreshRSS
- the markdown viewer

### Monitoring overlap

Monitoring is split across machines rather than being cleanly isolated. Grafana is currently running on NurseDroid, while the Orange Pi is also running Prometheus, Grafana-adjacent exporters, PostgreSQL, and NetFlow collection. That is more honest than the older one-sentence summary that implied a tidier split than the lab actually has.

## Clawd Operational Layer

The most interesting part of NurseDroid is not just Docker. It is the script and cron layer around the `~/clawd` workspace.

The active user crontab currently includes:

- morning briefing generation
- overnight heartbeat work
- Android to Home Assistant sync
- Android and markdown viewer health checks
- OpenClaw runtime checks
- a Home Assistant history sync job aimed at the Orange Pi

So the machine is doing two jobs at once:

- hosting services
- coordinating and checking the rest of the estate

## What Changed From Earlier Versions

The older post cleaned up the story too much. These are the important corrections:

- no, this is not just an "everything in Docker" story; the cron and helper-script layer matters
- the live container count is 12
- Grafana is still here even though the Orange Pi is also carrying serious monitoring duties
- the media stack described in the old post was only a partial view of what is actually running

## Current State

NurseDroid is stable and busy. It is not the only important machine anymore, but it is still the place where most of the cross-system glue lives.

---

*Setup guide: [How to build a Docker home server like this]({{ "/nursedroid-setup-guide/" | relative_url }})*
