---
layout: post
title: "Orange Pi RV2 — The Edge Device"
date: 2026-03-02
---

# Orange Pi RV2 — The Edge Device

The Orange Pi RV2 is the infrastructure's edge compute node — a RISC-V single-board computer that extends monitoring and AI workloads beyond the central server. What started as an experimental board has grown into a capable secondary node running its own monitoring stack, database, and custom AI services.

## The Hardware

The Orange Pi RV2 is a RISC-V architecture SBC with an 8-core SpacemiT K1 processor and 8GB of RAM. Unlike the ARM-based Raspberry Pi in the kitchen, this board uses the RISC-V instruction set — an open-source CPU architecture that's gaining traction in the embedded and edge computing space.

It runs Ubuntu 24.04 LTS with a 6.6-series kernel, giving it access to the standard Linux ecosystem despite the non-standard CPU architecture.

### Storage: SD Card to eMMC Migration

The board originally booted from a large SD card. An AI agent (Codex) migrated the entire root filesystem to the onboard 58GB eMMC storage using the vendor's `nand-sata-install` tool — a cleaner approach than manual `dd` operations. The boot chain runs through SPI flash (which holds the bootloader) directly to eMMC, so the SD card is no longer needed.

## What's Running

The Orange Pi is far from idle. It runs a full complement of services:

### Monitoring Stack
- **Prometheus** — Time-series metrics collection, running natively on RISC-V
- **Grafana** — Dashboarding and visualization (RISC-V native build)
- **Node Exporter** — Machine metrics for Prometheus
- **Blackbox Exporter** — Endpoint probing
- **SNMP Exporter** — Network device monitoring

This gives the Orange Pi its own independent monitoring capability, separate from the main server's Grafana/Prometheus/Loki stack.

### Data & Network
- **PostgreSQL 16** — Full relational database
- **nfdump/nfcapd** — NetFlow capture and analysis for network traffic monitoring
- **SNMP daemon** — Exposes the device's own metrics to network monitoring

### AI Services
- **AI Mode API** — A custom service described as "AI mode control API (risk/person)" — an edge AI inference or control endpoint running directly on the RISC-V hardware

### Security
- **Fail2Ban** — Intrusion prevention
- **Unattended Upgrades** — Automatic security patching

## The Setup Journey

The initial deployment was handled by AI agents across multiple sessions:

1. **OS deployment**: Ubuntu Noble Server image flashed to SD card and booted
2. **SSH key exchange**: Configured for passwordless access from the network
3. **Network integration**: Connected and given a static IP on the local network
4. **eMMC migration**: Codex transferred the full system from SD to eMMC in a single session, verified the cutover, and confirmed all services survived the reboot
5. **Service deployment**: Monitoring stack, PostgreSQL, and AI services deployed and configured

## Architecture Role

The Orange Pi serves as a **distributed monitoring and edge compute node**. Rather than running everything on the central server, the infrastructure splits workloads:

- **NurseDroid** handles media, photos, containers, and the autonomous agent
- **Orange Pi** handles network monitoring, metrics collection, and edge AI inference
- **Home Assistant** handles automation and device control

This distributed approach means no single device is a bottleneck. The Orange Pi's 8 cores and 8GB RAM handle the monitoring stack comfortably — current memory usage sits around 1GB with 5.4GB free.

## TermuxFloor — The Mobile Compute Node

Worth mentioning alongside the Orange Pi is another edge device: an Android phone running Termux (a Linux terminal emulator for Android). This device operates as a mobile compute node on the network.

Like the Orange Pi, it represents the idea of distributing compute across multiple small devices rather than centralizing everything on one server. Android + Termux provides a surprisingly capable Linux environment, with access to Python, Node.js, and other development tools.

Both devices point to a broader infrastructure philosophy: **compute should be distributed, not centralized**.

## Current State

The device is **online and stable**, running Ubuntu 24.04 LTS on RISC-V with 17GB of its 57GB eMMC in use. All services are active. The load average hovers around 3.2 across 8 cores, suggesting the monitoring and AI workloads keep it moderately busy.

Future growth areas include expanding the edge AI capabilities and potentially running distributed agent workloads to offload the main server.
