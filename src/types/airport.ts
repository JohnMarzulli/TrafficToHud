"use strict";

import { Coordinate } from "./coordinate";

/**
 * Information about an airport based on the FAA
 * published data.
 */
export class Airport {
    /**
     * The location of the airport.
     */
    public readonly coordinates: Coordinate;
    /**
     * The map identifier of the airport. Uses ICAO when available.
     */
    public readonly ident: string;
    /**
     * The name of the airport.
     */
    public readonly name: string;
    /**
     * The type code of the airport
     * AD: Airport
     * HP: Heliport
     * SP: Seaplane
     */
    public readonly airportType: string;
    /**
     * Is the airport public?
     */
    public readonly isPublic: boolean;

    public constructor(
        coordinates: Coordinate,
        ident: string,
        name: string,
        type: string,
        isPublic: boolean
    ) {
        this.coordinates = coordinates;
        this.ident = ident;
        this.name = name;
        this.airportType = type;
        this.isPublic = isPublic;
    }
}