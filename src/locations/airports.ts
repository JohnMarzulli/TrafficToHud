"use strict";

import { Request } from 'express';
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
        // Get the value of the specified parameter
        const distance: number = getDistanceFromRequest(req);
        const location: Coordinate = getLatLonFromRequest(req);

        return getAirportsWithinDistance(location, distance);
    }
    catch (error) {
        console.error("Error in getAirports:", error);

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
 * Load the frequencies data from the FAA CSV file.
 */
export function loadFrequencies(): void {
    if (airportFrequencies.size > 0) {
        return;
    }

    const lines: string[] = getCsvDataFileLines('FRQ.csv');

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

        if (!airportFrequencies.has(frequencyInfo.facilityId)) {
            airportFrequencies.set(frequencyInfo.facilityId, []);
        }

        airportFrequencies.get(frequencyInfo.facilityId)!.push(frequencyInfo);
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

    airportFrequencies.forEach((frequencies, ident) => {
        const foundDistance = getDistance(location, frequencies[0].coordinates);

        if (foundDistance <= distance) {
            const voiceFreqs: AirportFrequencies[] = getValidFrequencies(frequencies);

            if (voiceFreqs.length > 0) {
                foundAirportFrequencies[ident] = voiceFreqs;
            }
        }
    });

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

function getExpirations(): any {
    const expirationsPath = path.resolve(__dirname, '../../data/expirations.json');
    const expirationsContent = fs.readFileSync(expirationsPath, 'utf-8');
    const expirations = JSON.parse(expirationsContent);
    const airportsKey: string = "Airports.csv";

    return {
        expiration: expirations[airportsKey] ? expirations[airportsKey] : new Date().toISOString()
    };
}

function getLatLonFromRequest(
    req: Request
): Coordinate {
    const queryString: string = req.originalUrl.split("?")[1] ?? "";
    const queryParams: URLSearchParams = new URLSearchParams(queryString);

    // Get the value of the specified parameter
    const lat: number = parseFloat(queryParams.get("lat") ?? "0");
    const lon: number = parseFloat(queryParams.get("lon") ?? "0");
    const location: Coordinate = new Coordinate(lon, lat);

    return location;
}

function getDistanceFromRequest(
    req: Request
): number {
    const queryString: string = req.originalUrl.split("?")[1] ?? "";
    const queryParams: URLSearchParams = new URLSearchParams(queryString);

    // Get the value of the specified parameter
    const distance: number = parseFloat(queryParams.get("dist") ?? "0");

    return distance;
}

const airports: Airport[] = [];
const airportsByIdent: Map<string, Airport> = new Map<string, Airport>();
const airportFrequencies: Map<string, AirportFrequencies[]> = new Map<string, AirportFrequencies[]>();
const expirations = getExpirations();