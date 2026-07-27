# AithreToHud

## Introduction

This is a service that communicates with GDL-90 based ADS-B In receivers. It handles all of the complexities of networking, and then provides a simple interface for the StratuxHud.

It is intended to reduce the complexity of the StratuxHud software.

## Intended Usage

The primary purpose is for this service to be used by the StratuxHud project.

## Parts List

This service currently works with the following devices:

- Stratux 1.5 and newer.

## Installation

This service is included in the StratuxHud image.

If you are using the default release image, then no additional work is required.

These installation steps are intended for developers or those who wish to install from scratch.

```bash
npm install
```

### Service Installation

These instructions allow you to set TrafficToHud to start at boot on your StratuxHud Raspberry Pi that is running Trixie or newer.

1. Open a termina on the Raspberry Pi, or SSH to it
1. Make sure you have the latest code cloned into `/home/pi/TrafficToHud`
1. Move to the TrafficToHud folder (`cd /home/pi/TrafficToHud`)
1. Install the unit file by executing `sudo cp TrafficToHud.service /etc/systemd/system/TrafficToHud.service`
1. Reload systemd, enable on boot, start now
    1. `sudo systemctl daemon-reload`
    1. `sudo systemctl enable --now TrafficToHud.service`
1. After a reboot you may validate the service is running with: `sudo systemctl status TrafficToHud.service` and `journalctl -u TrafficToHud.service -f`

### Issues With Node

On Bookworm, 18 appears to be the most recent version.

First NodeJS and npm must be uninstalled using `apt`, then:

```bash
npm install
sudo npm install -g typescript
```

### Development Tools

Madge is used to find and prevent circular dependancies. (<https://github.com/pahen/madge>)

```powershell
madge  --orphans .\traffic-manager.ts;
madge  --circular .\traffic-manager.ts;
```

### Revision History

| Date       | Version   | Major Changes                                                        |
| ---------- | --------- | -------------------------------------------------------------------- |
| 2020-11-27 | 1.2       | Added new optional fields to support StratuxHUD v2. Package updates. |
| 2020-04-24 | 1.0 Alpha | Moved to own Repo.                                                   |
