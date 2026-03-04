---
layout: post
title: "Orange Pi RV2 — The Edge Device"
date: 2026-03-02
---

# Orange Pi RV2 — The Edge Device

I won this in a Home Assistant AUNZ competition. It's a RISC-V single-board computer — 8 cores, 8 GB RAM, dual gigabit ethernet, and a 2 TOPS AI accelerator. It started as an experiment and ended up becoming a real monitoring node.

## The Hardware

The Orange Pi RV2 runs a SpacemiT K1 processor with 8 RISC-V cores at 1.6 GHz. It's a different architecture from the ARM Pi 5 in the kitchen — RISC-V is open-source, less mature, but getting better fast. See [my comparison of the two]({{ "/pi5-vs-orangepi-rv2/" | relative_url }}).

It runs Ubuntu 24.04 LTS with a 6.6 kernel, booting from the onboard 58 GB eMMC rather than an SD card.

## The eMMC Migration

When I first set it up, it booted from a 512 GB SD card. Codex migrated the whole system to the onboard eMMC in a single session. Rather than doing a manual `dd` (risky on a RISC-V board with a non-standard boot chain), it found the vendor's built-in `nand-sata-install` tool and used that. Copied 321,250 files, updated the boot config, and verified everything came back up. The SD card isn't needed anymore.

The boot chain on this board goes: SPI flash (holds U-Boot) → eMMC (kernel + rootfs). Clean separation between bootloader and OS.

## What's Running

This thing is doing real work now:

**Monitoring Stack** — Prometheus, Grafana (both running natively on RISC-V), node exporter, blackbox exporter, SNMP exporter. This handles the monitoring for the whole homelab, keeping that workload off NurseDroid.

**Database** — PostgreSQL 16. Stores Grafana dashboards and any structured data the monitoring stack needs.

**Network Monitoring** — nfdump/nfcapd for NetFlow capture. With dual gigabit ethernet, this board is naturally suited to watching network traffic.

**AI Services** — There's a custom "AI Mode API" service running — an edge AI endpoint running directly on the RISC-V hardware.

**Security** — Fail2Ban for intrusion prevention, unattended upgrades for automatic patching.

## Resource Usage

With all that running, it uses about 1 GB of RAM out of 8 GB available. Load average sits around 3.2 across 8 cores, which is comfortably moderate. 17 GB of the 57 GB eMMC is in use.

For a board that costs a fraction of a "real" server, that's solid.

## Current State

Online and stable. Doing the job it was given. The RISC-V ecosystem has a few rough edges — some packages don't have riscv64 builds and need compiling — but for the monitoring workload, everything I need works.

---

*Setup guide: [How to set up an Orange Pi RV2]({{ "/orange-pi-setup-guide/" | relative_url }})*
