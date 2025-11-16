"use strict";

import * as fs from 'fs';
import * as path from 'path';
import { getDistance } from '../geography/distance';
import { Airport } from '../types/airport';
import { AirportFrequencies } from '../types/airportFrequencies';
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
        const distance: number = getDistanceFromRequest(req);
        const location: Coordinate = getLatLonFromRequest(req);

        return getAirportsWithinDistance(location, distance);
    }
    catch {
        return [];
    }
}

/**
 * Find any frequencies within the given radius (STATUTE MILES) of the given location
 * @param req 
 * @returns A dictionary with the facility identifier as the key. This indexes to a list of the facility's frequencies.
 */
export function getFrequencies(
    req: Request
): any {
    try {
        const distance: number = getDistanceFromRequest(req);
        const location: Coordinate = getLatLonFromRequest(req);

        return getAirportsFrequenciesWithinDistance(location, distance);
    }
    catch {
        return {};
    }
}
/**
 * Loads the list of airports from the FAA data.
 */
export function loadAirports(): void {
    if (airports.length > 0) {
        return;
    }

    const lines: string[] = getCsvDataFileLines('Airports.csv');

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
 * Load the frequencies data from the FAA CSV file.
 */
export function loadFrequencies(): void {
    if (airportFrequencies.size > 0) {
        return;
    }

    const lines: string[] = getCsvDataFileLines('nasr/FRQ.csv');

    for (const line of lines) {
        const trimmedLine = line.trim();

        if (trimmedLine.length < 10) {
            continue;
        }

        const tokens: string[] = trimmedLine.split(',');

        if (tokens.length < 10) {
            continue;
        }

        const frequencyInfo = new AirportFrequencies(tokens);

        if (!(frequencyInfo.facilityId in airportFrequencies)) {
            airportFrequencies[frequencyInfo.facilityId] = [];
        }

        airportFrequencies[frequencyInfo.facilityId].push(frequencyInfo);
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

/**
 * Find a list of frequencies with in the given radius from the given location.
 * @param location The location to use as our center point of search.
 * @param distance The RADIUS to search, given in STATUTE MILES.
 * @returns A dictionary with the facility identifier as the key. This indexes to a list of the facility's frequencies.
 */
export function getAirportsFrequenciesWithinDistance(
    location: Coordinate,
    distance: number
): { [key: string]: AirportFrequencies[]; } {
    const foundAirportFrequencies: { [key: string]: AirportFrequencies[]; } = {};

    for (const ident in airportFrequencies) {
        const foundDistance = getDistance(location, airportFrequencies[ident][0].coordinates);

        if (foundDistance <= distance) {
            const voiceFreqs: AirportFrequencies[] = getValidFrequencies(airportFrequencies[ident]);

            if (voiceFreqs.length > 0) {
                foundAirportFrequencies[ident] = airportFrequencies[ident];
            }
        }
    }

    return foundAirportFrequencies;
}

function getValidFrequencies(
    allFreqs: AirportFrequencies[]
): AirportFrequencies[] {
    const voiceFreqs: AirportFrequencies[] = [];

    for (const freq of allFreqs) {
        if (freq.facilityType === 'NAVAID') {
            continue;
        }

        if (freq.coordinates.latitude === undefined || freq.coordinates.latitude === null || Number.isNaN(freq.coordinates.latitude)) {
            continue;
        }

        voiceFreqs.push(freq);
    }

    return voiceFreqs;
}

function getCsvDataFileLines(
    fileShortName: string
): string[] {
    const filePath = path.resolve(__dirname, `../../data/${fileShortName}`);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    return fileContent.split('\n').slice(1);
}

function getLatLonFromRequest(
    req: Request
): Coordinate {
    const host: string = `http://${req.headers['host']}`;
    const fullUrl = new URL(req.url, host);
    const queryParams = new URLSearchParams(fullUrl.search);

    // Get the value of the specified parameter
    const lat: number = parseFloat(queryParams.get("lat"));
    const lon: number = parseFloat(queryParams.get("lon"));

    return new Coordinate(lon, lat);
}

function getDistanceFromRequest(
    req: Request
): number {
    const host: string = `http://${req.headers['host']}`;
    const fullUrl = new URL(req.url, host);
    const queryParams = new URLSearchParams(fullUrl.search);

    return parseFloat(queryParams.get("dist"));
}

const airports: Airport[] = [];
const airportFrequencies: Map<string, AirportFrequencies[]> = new Map<string, AirportFrequencies[]>();
const airportsByIdent: Map<string, Airport> = new Map<string, Airport>();