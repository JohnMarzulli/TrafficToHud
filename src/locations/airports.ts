"use strict";

import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { getDistance } from '../geography/distance';
import { Airport } from '../types/airport';
import { Coordinate } from "../types/coordinate";

/**
 * Get a list of any nearby airports
 * @param req The REST request
 * @returns A list of any airports within the given radius of the given location.
 */
export function getAirports(
    req: Request
): any {
    try {
        const host: string = `http://${req.headers['host']}`;
        const fullUrl = new URL(req.url, host);
        const queryParams = new URLSearchParams(fullUrl.search);

        // Get the value of the specified parameter
        const lat: number = parseFloat(queryParams.get("lat"));
        const lon: number = parseFloat(queryParams.get("lon"));
        const distance: number = parseFloat(queryParams.get("dist"));
        const location: Coordinate = new Coordinate(lon, lat);

        return getAirportsWithinDistance(location, distance);
    }
    catch {
        return [];
    }
}

/**
 * Loads the list of airports from the FAA data.
 */
export function loadAirports(): void {
    if (airports.length > 0) {
        return;
    }

    const filePath = path.resolve(__dirname, '../../data/Airports.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines: string[] = fileContent.split('\n').slice(1);

    for (const line of lines) {
        if (line.length < 10) {
            continue;
        }

        const tokens: string[] = line.split(',');

        const lat: number = parseFloat(tokens[1]);
        const lon: number = parseFloat(tokens[0]);
        const ident: string = tokens[4].trim();
        const airportName: string = tokens[5].trim();
        const icao: string = tokens[9].trim();
        const airportType: string = tokens[10].trim();
        const isPrivate: boolean = parseInt(tokens[15]) == 1;
        const key: string = icao.length > 0 ? icao : ident;

        const newAirport: Airport = new Airport(
            new Coordinate(lon, lat),
            key,
            airportName,
            airportType,
            !isPrivate);

        airportsByIdent.set(
            key,
            newAirport);

        airports.push(newAirport);
    }
}

/**
 * Get any airports that are within a given distance (STATUTE MILES)
 * @param location The location to find airports within a radius of
 * @param distance The maximum radius in STATUTE MILES
 * @returns Any airports found within the given distance.
 */
function getAirportsWithinDistance(
    location: Coordinate,
    distance: number
): Airport[] {
    const foundAirports: Airport[] = airports
        .filter(airport => { return airport.airportType === "AD"; })
        .filter(airport => {
            const foundDistance = getDistance(location, airport.coordinates);

            return foundDistance <= distance;
        });

    return foundAirports;
}

const airports: Airport[] = [];
const airportsByIdent: Map<string, Airport> = new Map<string, Airport>();

function hasAirport(
    airports: Airport[],
    ident: string
) {
    return airports.filter(airport => { return airport.ident === ident; }).length >= 1;
}

function testGetAirportsByDistance() {
    loadAirports();

    const foundAirports: Airport[] = getAirportsWithinDistance(
        new Coordinate(-122.15, 48.16),
        20.0);

    assert.strictEqual(foundAirports.length, 12);

    assert.strictEqual(hasAirport(foundAirports, "KAWO"), true);
    assert.strictEqual(hasAirport(foundAirports, "KPAE"), true);
    assert.strictEqual(hasAirport(foundAirports, "W10"), true);
    assert.strictEqual(hasAirport(foundAirports, "S43"), true);
    assert.strictEqual(hasAirport(foundAirports, "W10"), true);

    assert.strictEqual(hasAirport(foundAirports, "SEA"), false);
    assert.strictEqual(hasAirport(foundAirports, "BVS"), false);

    console.log("PASSED: Airport search tests.");
}

testGetAirportsByDistance();