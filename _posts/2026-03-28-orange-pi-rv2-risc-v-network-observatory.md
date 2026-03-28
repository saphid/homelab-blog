---
layout: post
title: "How a RISC-V Board Meant for ML Inference Became My Network Operations Center"
date: 2026-03-28
tags:
  - orange-pi-rv2
  - observability
  - build-log
  - networking
---

# How a RISC-V Board Meant for ML Inference Became My Network Operations Center

The Orange Pi RV2 was supposed to run object detection for my security cameras. Instead, it became the most network-aware device in my entire homelab — running 16 Grafana dashboards, monitoring 40+ hosts, and ingesting logs from servers ten times its size.

This is the story of how that happened, what the original ML architecture looked like, and what RISC-V actually feels like in 2026 when you put real workloads on it.

## The Hardware

The Orange Pi RV2 is a single-board computer built around SpaceMIT's K1 chip — an 8-core RISC-V processor with vector extensions. Here's what the system reports:

```
processor  : 0
model name : Ky(R) X1
isa        : rv64imafdcv_zicbom_zicboz_zicntr_zicond_zicsr_zifencei...
mmu        : sv39
uarch      : ky,x60
```

That `rv64imafdcv` prefix means 64-bit RISC-V with integer, multiply, atomic, float, double, compressed, and — importantly — vector instructions. The K1 includes over 30 ISA extensions, including `zvfh` (vector half-precision float) which matters for ML workloads.

The practical specs: 8 GB RAM, 57 GB eMMC storage, dual ethernet, running Ubuntu 24.04.4 LTS on a vendor-patched kernel (`6.6.63-ky`). It draws very little power and boots from onboard eMMC rather than an SD card.

I won it in a Home Assistant competition. The original plan was ambitious.

## The Original Plan: Edge ML Inference

The idea was to offload Frigate's object detection from my main server (NurseDroid, a Dell SFF running all my Docker containers) to the Orange Pi. Frigate is an NVR that processes camera feeds and detects objects — people, cars, animals. Detection is the CPU-hungry part.

The architecture used ZeroMQ to bridge the two machines:

```
Camera RTSP → Frigate (NurseDroid) → ZMQ REQ → Orange Pi RV2 (ZMQ REP, port 5555)
                                                    ↓
                                              ONNX Runtime + SpaceMIT EP
                                                    ↓
                                              YOLO11n (160x160)
                                                    ↓
                                              Detections ← ZMQ response
```

The detector service is a 293-line Python script that listens on a ZMQ REP socket and processes multipart frames. Each request carries a JSON header (shape, dtype, model type) plus raw tensor bytes. The response comes back as a 20x6 float32 array — up to 20 detections, each with class ID, confidence score, and normalized bounding box coordinates.

SpaceMIT provides a custom ONNX Runtime execution provider (`spacemit-ort`) that registers as `SpaceMITExecutionProvider`. The model loading tries SpaceMIT first and falls back to CPU:

```python
providers = ["SpaceMITExecutionProvider", "CPUExecutionProvider"]
session = ort.InferenceSession(str(path), sess_options=sess_options, providers=providers)
```

The model is YOLO11n exported at 160x160 resolution with ONNX opset 17. That opset constraint was hard-won — newer opsets failed to load on the SpaceMIT runtime. The export script (`export_yolo11_160_onnx.sh`) exists specifically because of this limitation.

Everything about this architecture is clean. The ZMQ protocol supports model management (check availability, upload new models, trigger loading) alongside inference. The post-processing handles both single-output and multi-part YOLO formats with proper NMS. The systemd unit restarts automatically. There's a UFW rule template. The rebuild-from-scratch guide covers every step.

It works. I tested it. The model loads, inference runs, detections come back.

## What Actually Happened

The ZMQ detector service is currently disabled.

```
spacemit-zmq-detector.service - SpaceMIT ZMQ detector for Frigate
     Loaded: loaded (/etc/systemd/system/spacemit-zmq-detector.service; disabled)
     Active: inactive (dead)
```

Frigate on NurseDroid is using its built-in CPU detector instead. The Orange Pi detector path is documented, deployed, and ready to go — but it's not the live inference path.

Meanwhile, the monitoring stack I set up "on the side" grew. And grew. And grew.

## The Network Observatory

Today the Orange Pi RV2 runs:

- **Prometheus** scraping its own metrics, host metrics via node exporter, EdgeRouter stats via SNMP exporter, and blackbox probes against 40+ devices
- **Grafana** with 16 dashboards covering network health, device SLAs, storage forecasts, security signal correlation, thermal monitoring, and log pipeline events
- **PostgreSQL 16** backing three databases — Prometheus state, Home Assistant recorder data, and an observability log store
- **rsyslog** receiving syslog on port 514 from NurseDroid (Frigate logs, among others)
- **nfcapd** collecting NetFlow data from the EdgeRouter
- **13 custom systemd timers** running every 1-10 minutes to collect EdgeRouter SNMP metrics, UniFi controller metrics, Home Assistant database metrics, network log processing, NetFlow analysis, and network inventory updates

The Prometheus configuration uses file-based service discovery to dynamically track DHCP clients. A timer job queries the EdgeRouter's lease table every 10 minutes, writes discovered hosts into a YAML file, and Prometheus picks them up for ICMP probing. Another set of static targets covers the UniFi controller, switch, and access points — labeled by device role.

The Grafana dashboard list tells the story of how this evolved:

```
dash-noc-exec-overview.json
dash-net-wan-health.json
dash-net-device-sla.json
dash-net-interface-errors.json
dash-net-conntrack-pressure.json
network-by-traffic.json
network-by-device.json
dash-host-performance-thermal.json
dash-host-storage-capacity.json
dash-storage-forecast.json
dash-data-freshness.json
dash-security-signals-correlation.json
dash-logs-pipeline-events.json
dash-ha-recorder-unified.json
dash-triage-incident-workbench.json
dash-ai-wakeword-rv2.json
```

That's a NOC executive overview, per-device SLA tracking, conntrack pressure monitoring, storage forecasting, security correlation, and an incident triage workbench. On a $30 RISC-V board.

The compute inventory for my homelab notes it this way: *"This host monitors the UniFi controller and the EdgeRouter, so it currently knows more about the network than any repo in HomeNet."* After auditing it, I'd say that's understated.

## ML on RISC-V: What Works

The ZMQ detector isn't the only ML workload that's been on this board. There's an active wake-word detection service that runs continuously:

```
wakeword-multistream.service - RV2 Multi-stream Wake-word Detection
     Active: active (running) since Thu 2026-03-12 02:00:16 UTC; 2 weeks ago
     Memory: 260.2M
     CPU: 2w 1d 8h 12min 20.141s
```

That CPU time is not a typo — the wake-word service has consumed over two weeks of CPU time in fifteen days of uptime. It's running inference on audio streams, listening for trigger phrases ("hey mycroft", "hey jarvis", "alexa", "hey rhasspy"), and publishing detections to MQTT on the Home Assistant host. Currently it's processing a looped test audio file, which explains the sustained core usage.

There's also a periodic timer (`ai-spacemit-ep-probe`) that tests the SpaceMIT execution provider, and an AI network anomaly detection timer that runs every five minutes.

The Python ML ecosystem works surprisingly well on RISC-V. The system has numpy 1.26.4, scipy 1.11.4, scikit-learn 1.4.1, Pillow 10.2.0, and ONNX 1.14.1 — all installed from Ubuntu's package repos for `riscv64`. SpaceMIT's custom ONNX Runtime extension (`spacemit-ort 1.2.2`) installs cleanly alongside them.

The main constraint I hit was ONNX opset compatibility. The SpaceMIT runtime accepted opset 17 but rejected newer exports. If you're working with ONNX models on RISC-V, export at the lowest opset that supports your operators — don't assume the latest will work.

## The Numbers

After fifteen days of uptime:

```
              total        used        free      shared  buff/cache   available
Mem:          7.7Gi       1.1Gi       332Mi       268Mi       6.7Gi       6.6Gi
```

1.1 GB used out of 7.7 GB available. The eMMC is at 42% capacity (22 GB of 57 GB). Load average hovers around 3.8 across 8 cores, mostly driven by the wake-word service and the logging pipeline.

The top CPU consumers tell you what the board actually does:

| Process | %CPU | Total CPU Time |
|---------|------|----------------|
| wakeword_multistream | 99.5% | 22,000 min |
| rsyslogd | 47.6% | 10,500 min |
| systemd-journald | 25.0% | 5,500 min |
| grafana | 2.9% | 647 min |
| node-exporter | 2.2% | 489 min |

The monitoring stack itself is lightweight. It's the ML inference and log ingestion that eat the cycles.

## Lessons Learned

**Scope creep is the real feature.** The monitoring stack was supposed to be a secondary role. It became the primary one because it was useful every day, while the detector was useful only when Frigate was configured to use it. Usefulness wins.

**RISC-V package support is better than expected.** Stock Ubuntu 24.04 packages for Prometheus, PostgreSQL, Grafana, Python scientific stack — they all work. You're not compiling from source for basic infrastructure anymore.

**SpaceMIT's ML runtime exists but has limits.** The execution provider registers and loads models, but the opset constraint and unclear acceleration status mean you should benchmark against CPU fallback before assuming you're getting hardware acceleration.

**Low-power boards are perfect for monitoring.** The Orange Pi draws a fraction of what NurseDroid uses, runs 24/7 without thermal concerns, and has enough RAM to comfortably run the full Prometheus/Grafana/PostgreSQL stack with headroom to spare.

**Build the thing, even if you don't use it.** The ZMQ detector architecture is dormant, but it's fully documented, tested, and deployable. If NurseDroid's CPU becomes a bottleneck, the Orange Pi can take over detection in minutes. Having a working fallback path is worth the engineering time.

## Current State

The Orange Pi RV2 is up, healthy, and doing exactly the kind of quiet, continuous work that justifies giving a device its own role. The ramlog partition is full (50 MB cap — needs attention), and the wake-word service should probably be configured with real audio sources instead of looping a test file. But the monitoring stack is solid.

If you told me a year ago that my most capable network monitoring node would be a RISC-V SBC I won in a competition, I wouldn't have believed you. But here we are — 16 dashboards, 40+ monitored hosts, three databases, and a dormant ML detector waiting in the wings.

---

*Previous posts: [Orange Pi RV2 — The Edge Device]({{ "/orange-pi-edge-device/" | relative_url }}) | [Setting Up an Orange Pi RV2 Monitoring Node]({{ "/orange-pi-setup-guide/" | relative_url }})*
