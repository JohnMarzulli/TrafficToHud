import { Request } from 'express';
import { Airport } from '../types/airport';
import { AirportFrequencies } from '../types/airportFrequencies';
import { Coordinate } from "../types/coordinate";
/**
 * Get a list of any nearby airports
 * @param req The REST request
 * @returns A list of any airports within the given radius of the given location.
 */
export declare function getAirports(req: Request): any;
/**
 * Find any frequencies within the given radius (STATUTE MILES) of the given location
 * @param req
 * @returns A dictionary with the facility identifier as the key. This indexes to a list of the facility's frequencies.
 */
export declare function getFrequencies(req: Request): any;
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
 * Load the frequencies data from the FAA CSV file.
 */
export declare function loadFrequencies(): void;
/**
 * Get any airports that are within a given distance (STATUTE MILES)
 * @param location The location to find airports within a radius of
 * @param distance The maximum radius in STATUTE MILES
 * @returns Any airports found within the given distance.
 */
export declare function getAirportsWithinDistance(location: Coordinate, distance: number): Airport[];
/**
 * Find a list of frequencies with in the given radius from the given location.
 * @param location The location to use as our center point of search.
 * @param distance The RADIUS to search, given in STATUTE MILES.
 * @returns A dictionary with the facility identifier as the key. This indexes to a list of the facility's frequencies.
 */
export declare function getAirportsFrequenciesWithinDistance(location: Coordinate, distance: number): {
    [key: string]: AirportFrequencies[];
};
