---
layout: post
title: "Setting Up an Orange Pi RV2 Monitoring Node"
date: 2026-03-02
---

# Setting Up an Orange Pi RV2 Monitoring Node

This guide covers turning an Orange Pi RV2 (RISC-V SBC) into a monitoring and edge compute node — the agent-assisted way and the manual way.

## What You'll Need

- Orange Pi RV2 (SpacemiT K1, 8-core RISC-V, 8GB RAM)
- MicroSD card for initial boot
- The onboard 58GB eMMC for permanent storage
- Ethernet cable (recommended for reliability)

---

## The Agent Approach

The Orange Pi was set up across two Codex sessions: one for initial deployment and eMMC migration, and a follow-up for service configuration.

### Session 1: Discovery and eMMC Migration

The agent's first task was identifying the device on the network. It:

1. **Scanned the subnet** using nmap from another machine on the network
2. **Tried multiple credentials** — the default `orangepi/orangepi` didn't work initially because the agent tried the wrong IP. After confirming the correct host via SSH banner and OS fingerprint, it got in.
3. **Mapped the storage** — identified `mmcblk0` (SD card, 512GB) as the current boot device and `mmcblk2` (eMMC, 58GB) as blank. Also identified SPI flash holding the bootloader chain.
4. **Chose the safe migration path** — rather than manually partitioning and using `dd`, the agent found the vendor's built-in `nand-sata-install` tool (an Armbian-derived script). It selected "Boot from eMMC - system on eMMC", chose ext4, and let the tool handle the transfer.
5. **Waited for the copy** — 321,250 files transferred to eMMC. The tool stopped services (cron, fail2ban) during copy to minimize open file handles.
6. **Verified the cutover** — after reboot, confirmed root was `/dev/mmcblk2p1` (eMMC), all services restarted, and monitoring endpoints responded.

### Session 2: Monitoring Stack Deployment

The agent deployed Prometheus, Grafana, PostgreSQL, and network monitoring tools, all running natively on RISC-V. This required finding RISC-V builds for each package — not all software has official RISC-V packages yet, so some were compiled from source.

### What Required Human Input

- Providing the correct IP and SSH credentials
- Approving the eMMC migration (destructive operation)
- Choosing which monitoring services to deploy

---

## The Manual Approach

### 1. Initial Boot from SD Card

Flash the Ubuntu Noble Server image for Orange Pi RV2 to a microSD card. Boot, connect via ethernet, and find the device on your network:

```bash
# From another machine on the network
nmap -sn 192.168.x.0/24  # replace x with your subnet
```

SSH in with default credentials (`orangepi/orangepi`) and change the password immediately.

### 2. Verify the Hardware

```bash
# Confirm RISC-V architecture
uname -m
# Should output: riscv64

# Check CPU details
cat /proc/cpuinfo | grep "model name"
# Should show: Ky(R) X1

# Map storage devices
lsblk
# mmcblk0 = SD card (current boot)
# mmcblk2 = eMMC (target)
# mtdblock0-5 = SPI flash (bootloader)
```

### 3. Migrate to eMMC

The Orange Pi RV2 boots from SPI flash (which holds U-Boot), then loads the kernel and rootfs from wherever the boot config points. The vendor migration tool handles updating this:

```bash
sudo nand-sata-install
```

Select:
- **Option 2**: "Boot from eMMC - system on eMMC"
- **Filesystem**: ext4

The tool will:
1. Partition and format the eMMC
2. Copy all files from SD to eMMC (this takes a while with hundreds of thousands of files)
3. Update the kernel `root=UUID` parameter to point to the eMMC
4. Write the bootloader to eMMC

After completion, power off, remove the SD card, and boot. The SPI flash bootloader will find U-Boot on eMMC and boot from there.

**Verify the migration:**
```bash
lsblk
# Root (/) should now be on mmcblk2p1
df -h /
# Should show mmcblk2p1
```

### 4. Install Monitoring Stack

**Prometheus** (check for RISC-V builds):
```bash
# May need to download the riscv64 binary from GitHub releases
# or install from the Ubuntu repository if available
sudo apt install -y prometheus prometheus-node-exporter
```

**Grafana** (RISC-V native):
```bash
# Grafana publishes riscv64 builds
# Check grafana.com/grafana/download for the latest
sudo apt install -y grafana
sudo systemctl enable --now grafana-server
```

**PostgreSQL**:
```bash
sudo apt install -y postgresql
sudo systemctl enable --now postgresql
```

**Network monitoring**:
```bash
sudo apt install -y nfdump  # NetFlow capture
sudo apt install -y snmpd   # SNMP daemon
```

### 5. Security Hardening

```bash
sudo apt install -y fail2ban ufw
sudo ufw allow ssh
sudo ufw enable
sudo systemctl enable --now fail2ban
```

### 6. Common RISC-V Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Package not found | No RISC-V build in apt | Download riscv64 binary from upstream releases or compile from source |
| eMMC not visible | Kernel module not loaded | Check `dmesg | grep mmc` for errors |
| Boot fails after migration | SPI bootloader not updated | Re-run `nand-sata-install` option 7 to update SPI bootloader |
| SSH drops after IP change | DHCP lease changed | Set a static IP via router DHCP reservation |
| High load average | 8 cores but single-threaded workloads | Normal for monitoring stacks; check with `htop` |
