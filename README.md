# Traffic To Hud

Traffic To Hud is a small service to ingest GDL-90 ADS‑B and related data sources, decode aviation messages (GDL‑90 / DLAC), and provide a simplified interface for frontends such as StratuxHud.

It is intended both for the StratuxHud distribution image and for local development where developers need to decode and inspect traffic, weather, and supporting data.

**Key goals:**

- Decode and normalize GDL‑90 messages (ownship, traffic, weather, AIRMET, METAR, etc.)
- Provide simple REST/WebSocket endpoints for UI clients
- Keep the StratuxHud client code simple by moving parsing/networking into this service

## Architecture (Module / Class view)

High-level modules (found under `src/`):

- `data-handling` — core parsing, transformations and helpers
- `traffic-manager` — central orchestrator for traffic and message routing
- `rest-server` — REST and WebSocket endpoints for clients
- `logging-object` — logging helpers and structured logging
- `clients/` — adapters for external sources (GDL90, radar, socket, status, traffic)
- `gdl-messages/` — message decoders (e.g. `airmet`, `dlac-decode`, `basic-report`)
- `geography/`, `locations/` — geospatial helpers and datasets
- `types/` — TypeScript type definitions and shared interfaces
- `weather/` — weather-specific parsing and helpers

ASCII class/module diagram (logical):

```text
src/
├─ traffic-manager.ts       # orchestrates modules
├─ rest-server.ts           # REST/WebSocket API
├─ data-handling.ts         # core parsing utilities
├─ logging-object.ts        # logging utilities
├─ clients/                 # external adapters (gdl90, radar, socket...)
└─ gdl-messages/            # decoders (airmet, metar, text reports...)
```

If you prefer a PlantUML or Mermaid diagram added to the docs I can add that as `docs/architecture.puml`.

## Installation

This repository is shipped inside the StratuxHud image. For development or local use:

1. Install dependencies:

```powershell
npm install
```

1. Build (TypeScript compilation or your usual build chain). This project uses TypeScript and has `typescript`/`gulp` in dev dependencies — run your usual build tool. Example (if you use `tsc`):

```powershell
npx tsc
```

Note: package scripts provide a `test` target; there is no top-level `build` script defined in `package.json` so use `tsc` or `gulp` as your environment requires.

## Running tests

Run the test suite configured in `package.json`:

```powershell
npm test
```

The test script runs a set of prebuilt JS tests under `build/tests`.

## Usage

- Default use: included and started inside the StratuxHud image — no manual install required.
- Local use: run the built service and connect your client (StratuxHud or a simple test client) to the REST/WebSocket endpoints exposed by `rest-server`.

Example (run tests only):

```powershell
npm test
```

## Data sources

The repository includes utilities and references for downloading airport/runway and airspace data. Common sources used in development:

- FAA ADDs / NASR datasets (airports, runways, frequencies)
- FAA open data endpoints (see original links in this file for specifics)

Most of the data can be found at <https://adds-faa.opendata.arcgis.com/search?collection=Dataset>

| Data Type                                        | Data Location                                                                                                                   |
|--------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| Airports CSV                                     | <https://adds-faa.opendata.arcgis.com/datasets/e747ab91a11045e8b3f8a3efd093d3b5_0/explore?location=4.003400%2C-1.633886%2C2.43> |
| Airport Frequencies (NASR, Frequency Data (FRQ)) | <https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/2025-02-20/>                                   |
| Runways CSV                                      | <https://adds-faa.opendata.arcgis.com/datasets/4d8fa46181aa470d809776c57a8ab1f6_0/explore?location=5.724382%2C-1.628771%2C2.63> |
| Frequencies JSON                                 | <https://adds-faa.opendata.arcgis.com/datasets/16966d553d454cca9706d2ce32b14d31_0/explore>                                      |
| Airspace JSON                                    | <https://adds-faa.opendata.arcgis.com/datasets/c6a62360338e408cb1512366ad61559e_0/explore?location=7.543542%2C-5.669382%2C2.65> |
| NASR                                             | <https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/NASR_Subscription/>                                              |

## Developer tools

- Use `madge` to detect circular dependencies and orphans. Example:

```powershell
madge --orphans .\src\traffic-manager.ts
madge --circular .\src\traffic-manager.ts
```

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo and create a feature branch
1. Add tests for new behavior under `src/tests` and/or `build/tests`
1. Run `npm test` locally
1. Open a PR against the `release` branch with a clear description

## License

See the `LICENSE` file for details.

## Revision History

| Date       | Version   | Major Changes                                                        |
|------------|-----------|----------------------------------------------------------------------|
| 2025-11-15 | 1.3       | Add weather, airport frequencies, locations, and more.               |
| 2020-11-27 | 1.2       | Added new optional fields to support StratuxHUD v2. Package updates. |
| 2020-04-24 | 1.0 Alpha | Moved to own Repo.                                                   |
