"use strict";

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
 * Returns the expiration dates of the loaded data.
 * @param req the incoming REST request (ignored)
 * @returns The set of expiration dates for the loaded airport data.
 */
export function getAirportDataStatus(
    req: Request
): any {
    try {
        return expirations;
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
export function getAirportsWithinDistance(
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

function getExpirations(): any {
    const expirationsPath = path.resolve(__dirname, '../../data/expirations.json');
    const expirationsContent = fs.readFileSync(expirationsPath, 'utf-8');
    const expirations = JSON.parse(expirationsContent);
    const airportsKey: string = "Airports.csv";

    return {
        expiration: expirations[airportsKey] ? expirations[airportsKey] : new Date().toISOString()
    };
}

const airports: Airport[] = [];
const airportsByIdent: Map<string, Airport> = new Map<string, Airport>();
const expirations = getExpirations();