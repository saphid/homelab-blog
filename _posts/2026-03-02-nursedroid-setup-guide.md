---
layout: post
title: "Setting Up a Docker Home Server"
date: 2026-03-02
---

# Setting Up a Docker Home Server

This guide covers building a Docker-based home server like NurseDroid — both how the AI agents did it and how to do it manually.

## What You'll Need

- An Intel or AMD-based PC (small form factor works well)
- Ubuntu Server (or any Linux distro with Docker support)
- Enough RAM for your containers (16GB+ recommended; 8GB workable if you skip ML workloads)
- Storage for media, photos, and databases

---

## The Agent Approach

NurseDroid's services were set up across multiple sessions by different agents: Clawdbot (Wisp framework) handled ongoing maintenance and new service deployments, while interactive Claude Code sessions handled specific tasks.

### What the Agents Did

1. **Docker Compose setup**: Created compose files for each service stack, handling volume mounts, networking, and environment variables
2. **Immich deployment**: Deployed the 4-container Immich stack (server, ML, Postgres with vector extensions, Valkey) with ML acceleration enabled
3. **Monitoring stack**: Set up Grafana + Prometheus for infrastructure monitoring
4. **RAM optimization**: Identified Kubernetes consuming 3.6GB despite not being used; stopped k8s services to reclaim memory for Docker
5. **Markdown viewer**: Built and containerized a custom markdown rendering service
6. **Self-maintenance**: Clawdbot set up its own cron-based resurrection, memory sync services, and work logging

### What Required Human Decision

- Which services to run (media stack composition, monitoring tools)
- Storage mount points and directory structure
- Network configuration (static IPs, DNS)
- Whether to kill Kubernetes (the agent recommended it, the human approved)

---

## The Manual Approach

### 1. Base System Setup

Install Ubuntu Server, update packages, and install Docker:

```bash
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install -y docker-compose-plugin
```

### 2. Organize Your Compose Files

Create a directory structure for your services:

```
~/docker/
├── immich/
│   └── docker-compose.yml
├── media/
│   └── docker-compose.yml
├── monitoring/
│   └── docker-compose.yml
└── services/
    └── docker-compose.yml
```

### 3. Immich (Self-Hosted Photos)

Immich needs four containers. The key detail is the Postgres image — it needs vector extensions for ML-powered search:

```yaml
services:
  immich-server:
    image: ghcr.io/immich-app/immich-server:v2
    volumes:
      - /path/to/photos:/usr/src/app/upload
    env_file: .env
    depends_on:
      - redis
      - database

  immich-machine-learning:
    image: ghcr.io/immich-app/immich-machine-learning:v2
    volumes:
      - model-cache:/cache

  database:
    image: ghcr.io/immich-app/postgres:14-vectorchord0.4.3-pgvectors0.2.0
    env_file: .env
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: valkey/valkey:9
```

**Gotcha**: Don't use a standard Postgres image. Immich requires the `pgvectors` extension for ML similarity search, which is baked into their custom Postgres image.

### 4. Media Stack

The *arr suite for media management:

```yaml
services:
  plex:
    image: lscr.io/linuxserver/plex:latest
    environment:
      - PUID=1000
      - PGID=1000
    volumes:
      - /path/to/media:/media

  transmission:
    image: linuxserver/transmission
    volumes:
      - /path/to/downloads:/downloads

  calibre:
    image: lscr.io/linuxserver/calibre:latest
    volumes:
      - /path/to/books:/books
```

### 5. Monitoring

Grafana + Prometheus gives you visibility into your infrastructure:

```yaml
services:
  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana-data:/var/lib/grafana
```

On NurseDroid, Prometheus runs on the Orange Pi RV2 rather than the main server — distributing the monitoring workload.

### 6. Infrastructure Management

```yaml
services:
  portainer:
    image: portainer/portainer-ce:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer-data:/data

  freshrss:
    image: lscr.io/linuxserver/freshrss:latest
    volumes:
      - freshrss-config:/config

  syncthing:
    image: lscr.io/linuxserver/syncthing:latest
    volumes:
      - syncthing-config:/config
      - /path/to/sync:/data
```

### 7. RAM Management

If you installed Kubernetes and don't need it:

```bash
# Check what's using RAM
free -h
ps aux --sort=-%mem | head -20

# If k8s is eating resources
sudo systemctl stop kubelet
sudo systemctl disable kubelet
sudo systemctl stop k3s  # or k3s-agent
sudo systemctl disable k3s
```

On NurseDroid, this freed 3.6GB — enough to comfortably run Immich with ML acceleration.

### 8. Setting Up an Autonomous Agent (Optional)

If you want to run something like Clawdbot, the key components are:

- **A memory directory**: Structured markdown files the agent can read/write between sessions
- **Cron-based resurrection**: A cron job that checks if the agent process is running and restarts it
- **A task backlog**: A markdown or JSON file the agent reads to decide what to work on
- **Logging**: The agent should write diary/log entries so you can review what it did

The Wisp framework handles this for Clawdbot, but the pattern is simple enough to implement with any LLM API + a shell script wrapper.

### 9. Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Immich ML OOM | Not enough RAM | Stop k8s or reduce ML model size |
| Postgres won't start | Wrong image (missing pgvectors) | Use Immich's custom Postgres image |
| Containers can't talk | Docker network isolation | Put related containers in the same compose file or shared network |
| Disk filling up | Media downloads + photo uploads | Set up retention policies and monitoring alerts |
| Plex "server not found" | Network mode or port mapping | Check Docker network mode and port bindings |
