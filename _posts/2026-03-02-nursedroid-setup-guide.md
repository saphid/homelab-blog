---
layout: post
title: "Setting Up a Docker Home Server"
date: 2026-03-02
tags:
  - nursedroid
  - setup-guide
---

# Setting Up a Docker Home Server

This guide is based on the NurseDroid layout as it exists now. The main lesson is not "put everything in one giant compose file." The main lesson is to separate service groups, keep health checks nearby, and accept that useful hosts end up with both containers and plain host-side automation.

## What You'll Need

- an always-on Linux box
- Docker and the Compose plugin
- enough RAM for photo, feed, and utility services
- a directory layout you can still understand three months later

---

## The Agent Approach

NurseDroid was not built in one shot. The useful pattern that emerged was:

1. deploy service groups separately
2. keep their data paths stable
3. add cron and small scripts for health checks, sync, and reporting

The current host has compose files in multiple places, including:

- `~/docker-compose.yml`
- `~/media_docker/docker-compose.yml`
- `~/clawd/docker/docker-compose.yml`

That is a bit messy, but it reflects real growth rather than a clean-room demo.

## The Manual Approach

### 1. Install Docker

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
sudo apt install -y docker-compose-plugin
```

### 2. Split services by concern

A practical grouping is:

- photos
- media
- utility services
- monitoring

That lets you restart and reason about one layer at a time.

### 3. Verify the runtime, not just the YAML

On a host like this, the useful commands are:

```bash
docker ps
crontab -l
find "$HOME" -maxdepth 3 -name docker-compose.yml -o -name compose.yml
```

Those three commands tell you more about reality than a README that has gone stale.

### 4. Keep host-side scripts first-class

The audited NurseDroid setup relies on cron and helper scripts for:

- Android sensor sync
- stack health checks
- morning briefings
- maintenance advice
- markdown viewer checks

That means your runbook needs to document both Docker and the host cron layer.

### 5. Let the machine evolve, but keep the blog honest

It is fine if one box ends up with photo hosting, feeds, sync services, and coordination scripts. It is not fine to keep documenting the machine as if it still matches its earlier simpler story.

## Validation Checklist

After setup, verify:

1. the expected containers are running
2. each compose group is restartable on its own
3. host cron jobs are present and writing logs where expected
4. other machines can still consume the services they depend on

That last point is what turns a box from "a pile of containers" into infrastructure.
