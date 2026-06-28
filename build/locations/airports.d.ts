import { Airport } from '../types/airport';
import { Coordinate } from "../types/coordinate";
/**
 * Get a list of any nearby airports
 * @param req The REST request
 * @returns A list of any airports within the given radius of the given location.
 */
export declare function getAirports(req: Request): any;
/**
 * Returns the expiration dates of the loaded data.
 * @param req the incoming REST request (ignored)
 * @returns The set of expiration dates for the loaded airport data.
 */
export declare function getAirportDataStatus(req: Request): any;
/**
 * Loads the list of airports from the FAA data.
 */
export declare function loadAirports(): void;
/**
 * Get any airports that are within a given distance (STATUTE MILES)
 * @param location The location to find airports within a radius of
 * @param distance The maximum radius in STATUTE MILES
 * @returns Any airports found within the given distance.
 */
export declare function getAirportsWithinDistance(location: Coordinate, distance: number): Airport[];
