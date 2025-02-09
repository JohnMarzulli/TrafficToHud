import * as fs from 'fs';
import * as path from 'path';
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
    const url = new URL(req.url);
    const queryParams = new URLSearchParams(url.search);

    // Get the value of the specified parameter
    const lat: number = parseFloat(queryParams.get("lat"));
    const lon: number = parseFloat(queryParams.get("lon"));
    const distance: number = parseFloat(queryParams.get("distance"));
    const location: Coordinate = new Coordinate(lon, lat);

    return getAirportsWithinDistance(location, distance);
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

        const lat: number = parseFloat(tokens[0]);
        const lon: number = parseFloat(tokens[1]);
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

function getDistance(
    firstPoint: Coordinate,
    otherPoint: Coordinate
): number {
    const R = 6371e3; // Earth's mean radius in meters

    // Convert degrees to radians
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const lat1 = toRadians(firstPoint.latitude);
    const lat2 = toRadians(otherPoint.latitude);
    const deltaLat = toRadians(otherPoint.latitude - firstPoint.latitude);
    const deltaLon = toRadians(otherPoint.longitude - firstPoint.longitude);

    const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

function getAirportsWithinDistance(
    location: Coordinate,
    distance: number
): Airport[] {
    return airports.filter(airport => {
        return getDistance(location, airport.coordinates) <= distance;
    });
}

const airports: Airport[] = [];
const airportsByIdent: Map<string, Airport> = new Map<string, Airport>();