---
layout: post
title: "Homelab Audit Snapshot — March 8, 2026"
date: 2026-03-08
tags:
  - audit
  - nursedroid
  - kitchen-screen
  - pixel-termux
  - home-assistant
  - orange-pi-rv2
---

# Homelab Audit Snapshot — March 8, 2026

This post is the reference point for the rest of the site. I checked the running hosts, the on-disk Clawd docs, and the archived Codex session logs before rewriting the other pages.

## Verified Current State

### NurseDroid

NurseDroid is reachable and currently running 12 Docker containers:

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

It also has an active user crontab for Clawd maintenance work, morning briefing generation, Android-to-Home-Assistant sync, markdown viewer health checks, OpenClaw runtime checks, and a sync job that pushes Home Assistant history toward the Orange Pi.

### Orange Pi RV2

The Orange Pi section is the part of the March 8 rewrite that needs the most caution now.

Earlier notes from the same rewrite described it as a live `riscv64` monitoring node with Prometheus, Grafana, PostgreSQL, exporters, and NetFlow capture. In the current session from this Mac, I could not re-establish SSH to the box:

- the local `orangepi` alias did not resolve
- a direct SSH attempt to the earlier LAN address timed out

So the safe current statement is:

- NurseDroid still has a history sync job targeting the Orange Pi
- the archive still contains the earlier Orange Pi writeups
- current live verification is blocked until the SSH path is working again from this machine

### Kitchen Screen

The kitchen screen host is a Raspberry Pi 5. The active dashboard implementation is no longer the older `fridge-dashboard` Flask app described in the earliest sessions. The live implementation is `~/next-dashboard`, a Next.js plus TypeScript monorepo with:

- web app on `127.0.0.1:3000`
- API on `127.0.0.1:8126`
- Labwc autostart entries that run `~/next-dashboard/run-kiosk.sh` and `~/next-dashboard/kiosk-watchdog.sh`

The current API returns real data:

- `/api/home_summary`
- `/api/calendar`
- `/api/cameras`

Legacy `fridge-*` service names and log directories still exist, which is useful historical evidence but should not be confused with the current app path.

### Termux Pixel Phone

The Pixel node is a Pixel 3 on Android 12, reachable over Termux SSH. It is currently acting as an Android sensor bridge more than as a general remote compute node.

The live processes I checked were:

- `sshd`
- `python3 ~/clawd/android-ha-api.py`
- active `termux-sensor` sampling

The local Android API responds on `127.0.0.1:8080` with data from:

- `/healthz`
- `/battery`
- `/wifi`
- `/system`
- `/sensors`

An `.openclaw` directory exists on the phone, but I did not find active proof in this audit that it is currently operating as a full OpenClaw execution node. Earlier drafts overstated that part.

### Home Assistant

Home Assistant is reachable on the LAN and responded to live API checks during the audit. The current entity count is 1,160, including:

- 339 `sensor`
- 367 `binary_sensor`
- 23 `light`
- 14 `cover`
- 51 `switch`
- 10 `media_player`
- 24 `device_tracker`
- 3 `camera`

The Android sensor sync path is live:

- phone-side `android-ha-api.py`
- NurseDroid cron-based `android-ha-state-sync.py`
- `android-ha-stack-health-check.sh`

The entity `sensor.android_battery` and related Android entities are updating successfully.

## Historical Corrections

The archived session logs matter, but several earlier blog claims needed to be downgraded from "current fact" to "historical build note."

- The kitchen screen did begin life as a Flask-style `fridge-dashboard`, but that is not the current deployment path anymore.
- The Orange Pi was originally discussed at an earlier LAN address and later moved; the older rewrite treated it as currently reachable, but the present session could not re-verify it and now marks that status as blocked.
- The Termux phone was planned as a richer OpenClaw node, but the live evidence today supports a narrower claim: it is a useful SSH-accessible Android sensor and API bridge.
- Earlier NurseDroid summaries talked about 11 containers and a simpler media stack. The current host is at 12 running containers and does not match that older simplified list exactly.

## How I Am Using This Snapshot

Every other page on the blog now follows this rule:

- current state comes from live host checks where possible
- older build details come from archived Codex or Clawd notes
- if I could not verify something live, I say so instead of smoothing it over
