---
layout: post
title: "Verified Homelab Audit Note - March 8, 2026"
date: 2026-03-08
tags:
  - audit
  - nursedroid
  - kitchen-screen
  - pixel-termux
  - home-assistant
  - deployment
---

# Verified Homelab Audit Note - March 8, 2026

This note is based on live checks from the control workspace on March 8, 2026. It separates what I actually re-verified today from older build history that still exists in the other repos and blog drafts.

## Active Workspaces

The clearest homelab activity in Codex session metadata today was:

- `kitchenscreen`
- `pixelserver`
- `skills_building`
- `homelab_blog`

That lines up with the systems I could directly re-check from this machine: the kitchen dashboard, the Pixel Termux bridge, the blog publishing path, and NurseDroid as the main service host behind them.

## Verified Live State

### NurseDroid

NurseDroid is reachable and currently has 12 Docker containers up, including the Immich stack, Grafana, Syncthing, Portainer, FreshRSS, Calibre, and Transmission.

The more important detail is the cron and script layer around the Clawd workspace. The active crontab still includes Android-to-Home-Assistant sync, Android stack health checks, phone watchdog checks, OpenClaw runtime checks, and a Home Assistant history sync job aimed at the Orange Pi. That means the box is still doing orchestration work as well as service hosting.

### Pixel 3 in Termux

The Pixel path is live and useful rather than hypothetical.

- SSH identity checks confirmed the Pixel 3 model and device codename
- `sshd` is running
- `android-ha-api.py` is running
- the local health endpoint returned `status=ok`

That is enough to support a narrow but solid claim: the phone is currently operating as an Android sensor and API bridge for the rest of the homelab.

### Kitchen Screen

The kitchen display host is reachable and still running the newer `next-dashboard` stack.

- `run-kiosk.sh` is running
- `kiosk-watchdog.sh` is running
- `next start` is running
- API health returned version `v2026.03.08.07`
- `/api/home_summary` returned live weather and people data

This is the strongest present-tense proof that the kitchen screen is not just an old build story. It is still an active household display pulling real data today.

## Blockers And Unknowns

The Orange Pi RV2 was not reachable from this workspace during the current audit. A saved SSH alias did not resolve locally and the direct LAN SSH attempt timed out.

So the right thing to say is not "the Orange Pi is definitely live." The right thing to say is that older notes exist about it, NurseDroid still has a sync job targeting it, and current live verification is blocked until SSH is working again from this machine.

## Why This Matters

This kind of post is useful only if it keeps current state honest.

The kitchen screen, the Pixel bridge, and NurseDroid all still have clear live evidence. The Orange Pi does not in this session. That distinction is exactly what the blog workflow needs to preserve if the posts are going to be worth reading later.

The underlying checks were run during the audit, but the raw verification commands are intentionally left out of the public post.
