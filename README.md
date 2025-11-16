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

### Issues With Node

On Bookworm, 18 appears to be the most recent version.

First NodeJS and npm must be uninstalled using `apt`, then:

```bash
npm install
sudo npm install -g typescript
```

### Data Downloads

From: https://adds-faa.opendata.arcgis.com/search?collection=Dataset

Airports CSV: https://adds-faa.opendata.arcgis.com/datasets/e747ab91a11045e8b3f8a3efd093d3b5_0/explore?location=4.003400%2C-1.633886%2C2.43
Airport Frequencies (NASR, Frequency Data (FRQ)) : https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/2025-02-20/ 
Runways CSV: https://adds-faa.opendata.arcgis.com/datasets/4d8fa46181aa470d809776c57a8ab1f6_0/explore?location=5.724382%2C-1.628771%2C2.63
Frequencies JSON: https://adds-faa.opendata.arcgis.com/datasets/16966d553d454cca9706d2ce32b14d31_0/explore
Airspace JSON: https://adds-faa.opendata.arcgis.com/datasets/c6a62360338e408cb1512366ad61559e_0/explore?location=7.543542%2C-5.669382%2C2.65
NASR: https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/

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
