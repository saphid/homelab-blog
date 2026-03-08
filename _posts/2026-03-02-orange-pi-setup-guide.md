---
layout: post
title: "Setting Up an Orange Pi RV2 Monitoring Node"
date: 2026-03-02
---

# Setting Up an Orange Pi RV2 Monitoring Node

This guide is based on the live Orange Pi RV2 node in the homelab. The good news is that the stack ended up being simpler than the original research phase made it sound.

## What You'll Need

- Orange Pi RV2
- Ubuntu 24.04 on the board
- network access over ethernet
- a monitoring plan that justifies a separate node

---

## The Agent Approach

The original work on the board had two phases:

1. get the hardware stable and move the OS onto eMMC
2. install a practical monitoring stack that actually fits the board

The live machine shows the second phase succeeded.

## The Manual Approach

### 1. Confirm the board is on eMMC

The audited board is booting from `mmcblk2p1`, which is the onboard eMMC path rather than the original SD-card setup.

### 2. Install the service set that is actually running

The live node has Ubuntu packages for:

- `prometheus`
- `prometheus-node-exporter`
- `prometheus-blackbox-exporter`
- `prometheus-snmp-exporter`
- `postgresql-16`
- `nfdump`
- `fail2ban`
- `snmpd`

That means a mostly package-managed setup works here. You do not need to start with a heroic compile-from-source strategy for the basic monitoring stack.

### 3. Verify ports and services

The minimum runtime checks are:

```bash
systemctl --type=service --state=running
curl -I http://127.0.0.1:3000/login
curl -I http://127.0.0.1:9090/-/ready
curl -I http://127.0.0.1:9100/metrics
curl -I http://127.0.0.1:9116/metrics
```

### 4. Add NetFlow only if you need it

The audited machine is also running:

```bash
/usr/bin/nfcapd -w /var/lib/nfdump -p 2055 -t 60
```

That is a useful fit for the board, but only if you actually plan to collect and keep flow data.

### 5. Treat AI or auxiliary services as optional

There is a live `ai-mode-api.service` on the board, but the core win is the monitoring stack. Build that first. Add extra experiments later.

## Validation Checklist

After setup, verify:

1. the board is booting from eMMC
2. Prometheus, Grafana, exporters, and PostgreSQL all start cleanly
3. the expected ports respond locally
4. RAM use still leaves comfortable headroom

The current node passes all four of those checks, which is why it is worth documenting.
