import { Coordinate } from "./coordinate";
/**
 * Information about an airport based on the FAA
 * published data.
 */
export declare class Airport {
    /**
     * The location of the airport.
     */
    readonly coordinates: Coordinate;
    /**
     * The map identifier of the airport. Uses ICAO when available.
     */
    readonly ident: string;
    /**
     * The name of the airport.
     */
    readonly name: string;
    /**
     * The type code of the airport
     * AD: Airport
     * HP: Heliport
     * SP: Seaplane
     */
    readonly airportType: string;
    /**
     * Is the airport public?
     */
    readonly isPublic: boolean;
    constructor(coordinates: Coordinate, ident: string, name: string, type: string, isPublic: boolean);
}
