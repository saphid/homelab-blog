---
layout: post
title: "Orange Pi RV2 — The Edge Device"
date: 2026-03-02
tags:
  - orange-pi-rv2
  - observability
  - deployment
---

# Orange Pi RV2 — The Edge Device

The Orange Pi RV2 stopped being just a competition curiosity. It is now a real monitoring node in the homelab.

## Verified Current State

At audit time the board was:

- reachable live as `orangepi`
- running Ubuntu 24.04.4 LTS on `riscv64`
- booting from onboard eMMC
- using about 1 GB RAM out of 7.7 GB available

These services were actively running:

- Prometheus
- Grafana
- PostgreSQL 16
- node exporter
- blackbox exporter
- SNMP exporter
- `nfcapd` for NetFlow capture
- `ai-mode-api`
- Fail2Ban
- `snmpd`

The expected local ports also responded:

- `3000` for Grafana
- `9090` for Prometheus
- `9100` for node exporter
- `9115` for blackbox exporter
- `9116` for SNMP exporter
- `5432` for PostgreSQL

## What It Is Good At

This machine makes sense as a monitoring and observability node because it has:

- dual ethernet
- onboard eMMC
- enough RAM to stay comfortable under the current service mix
- a workload that is mostly long-running services rather than interactive UI

The live load average was a bit above 3 across 8 cores, which is entirely reasonable for this role.

## How It Got Here

The archived Codex sessions and local research notes still matter:

- the board started as a Home Assistant competition win
- it was first discussed and accessed on an older address
- the system was migrated from SD to eMMC
- the early plan was broader network capture and analysis

The important thing now is that the board actually made the transition from "interesting hardware plan" to "operational monitoring node."

## What Changed From The Older Post

The older post was directionally right but still half future-tense. The current version is stronger because it is based on live service checks, not just research notes about what the board should be able to do.

## Current State

The Orange Pi RV2 is one of the clearest wins in the setup. It is doing exactly the kind of boring, continuous work that justifies giving a separate machine its own role.

---

*Setup guide: [How to set up an Orange Pi RV2]({{ "/orange-pi-setup-guide/" | relative_url }})*
