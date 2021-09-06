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

If you wish to run the service at startup:

```bash
crontab -e
```

Insert the following line:

```bash
@reboot nodejs       /home/pi/TrafficToHud/build/traffic_manager.js &
```

Save and close.

### Revision History

| Date       | Version   | Major Changes                                                        |
| ---------- | --------- | -------------------------------------------------------------------- |
| 2020-11-27 | 1.2       | Added new optional fields to support StratuxHUD v2. Package updates. |
| 2020-04-24 | 1.0 Alpha | Moved to own Repo.                                                   |
