# AithreToHud

## Introduction

This is a service that communicates with GDL-90 based ADS-B In receivers. It handles all of the complexities of networking, and then provides a simple interface for the StratuxHud.

It is intended to reduce the complexity of the StratuxHud software.

## Intended Usage

The primary purpose is for this service to be used by the StratuxHud project.

## Parts List

This service currently works with the following devices:

- Stratux 1.5 and newer.

## Data sources

The repository includes utilities and references for downloading airport/runway and airspace data. Common sources used in development:

- FAA ADDs / NASR datasets (airports, runways, frequencies)
- FAA open data endpoints (see original links in this file for specifics)

Most of the data can be found at <https://adds-faa.opendata.arcgis.com/search?collection=Dataset>

| Data Type                                        | Data Location                                                                                                                   |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Airports CSV                                     | <https://adds-faa.opendata.arcgis.com/datasets/e747ab91a11045e8b3f8a3efd093d3b5_0/explore?location=4.003400%2C-1.633886%2C2.43> |
| NASR (FRQ.csv)                                   | <https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/>                                              |
| Runways CSV                                      | <https://adds-faa.opendata.arcgis.com/datasets/4d8fa46181aa470d809776c57a8ab1f6_0/explore?location=5.724382%2C-1.628771%2C2.63> |
| Frequencies JSON                                 | <https://adds-faa.opendata.arcgis.com/datasets/16966d553d454cca9706d2ce32b14d31_0/explore>                                      |
| Airspace JSON                                    | <https://adds-faa.opendata.arcgis.com/datasets/c6a62360338e408cb1512366ad61559e_0/explore?location=7.543542%2C-5.669382%2C2.65> |

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

### Available Endpoints (Debugging)

Please note that the protocol is "HTTP", not "HTTPS"

| Route                                                | Purpose                                                                                                        | Example                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| /                                                    | Gets the name and version of the service                                                                       | <http://localhost:8000/>                                               |
| /Service/Info                                        | Same as '/'                                                                                                    | <http://localhost:8000/Service/Info>                                   |
| /Service/Reset                                       | Clears all cache and memory. Intended for debug and diagnostics.                                               | <http://localhost:8000/Service/Info>                                   |
| /Service/Status                                      | Gives info about the connection to the Stratux, and recent data reception. Intended for debug and diagnostics. | <http://localhost:8000/Service/Status>                                 |
| /Traffic/Summary                                     | Returns a list of tail numbers, IACO IDs, and how recently the traffic was last updated                        | <http://localhost:8000/Traffic/Summary>                                |
| /Traffic/Full                                        | Returns the set of ALL information known about all recent traffic.                                             | <http://localhost:8000/Traffic/Full>                                   |
| /Traffic/Reliable                                    | Returns the set of ALL information known about recent traffic that has a RELIABLE position and data.           | <http://localhost:8000/Traffic/Reliable>                               |
| /Traffic/:id                                         | Returns all of the known data about a single aircraft. Uses the IACO code as the key.                          | <http://localhost:8000/Traffic/10563870>                               |
| /Status/Status                                       | Returns the status of the service providing status updates. Intended for debug and diagnostics.                | <http://localhost:8000/Status/Status>                                  |
| /Status/Full                                         | Returns a rich status about the GPS, UAT, signal strength, and other radio related information                 | <http://localhost:8000/Status/Full>                                    |
| /Radar/Status                                        | Returns a status about the "Radar" service. Intended for debug and diagnostics.                                | <http://localhost:8000/Radar/Status>                                   |
| /Radar/Full                                          | Returns a full list of all known traffic.                                                                      | <http://localhost:8000/Radar/Full>                                     |
| /Gdl90/Status                                        | Returns the status of the GDL 90 service. Intended for debug and diagnostics.                                  | <http://localhost:8000/Gdl90/Status>                                   |
| /Gdl90/Full                                          | Returns a set of recent, RAW, GDL90 messages.  Intended for debug and diagnostics.                             | <http://localhost:8000/Gdl90/Full>                                     |
| /Weather/Reflectivity                                | Returns the set of decoded NEXRAD reflectivity blocks.                                                         | <http://localhost:8000/Weather/Reflectivity>                           |
| /Weather/TextReports                                 | Returns a set of METAR, TAF, AIRMET, and TEXT reports recieved over UAT.                                       | <http://localhost:8000/Weather/TextReports>                            |
| /Weather/FlightRules                                 | Returns a list of airports that have known and recent METARS from which flight rules can be derived.           | <http://localhost:8000/Weather/FlightRules>                            |
| /airports/Status                                     | Returns a status about the "Airports" service. Intended for debug and diagnostics.                             | <http://localhost:8000/Airports/Status>                                |
| /airports/Airports?lat=<lat>&lon=<lon>&dist=<radius> | Returns a list of known, nearby airports. Requires coordinates and a distance.                                 | <http://localhost:8000/Airports/Airports?lat=48.16&lon=-122.2&dist=50> |
