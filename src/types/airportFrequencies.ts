"use strict";

import { Coordinate } from "./coordinate";

/**
 * Holds information about frequencies as published by the FAA
 */
export class AirportFrequencies {
    /**
     * The ID of the facility. Normally the 3 leter airport code (IE: AWO)
     */
    public readonly facilityId: string;

    /**
     * The human readable name of the facility. (IE: Arlington Municipal)
     */
    public readonly facilityName: string;

    /**
     * The type of facility. (IE: NON-ATC for a non towered airport)
     */
    public readonly facilityType: string;

    /**
     * A Flight Service Id if there is one. (90% blank)
     */
    public readonly artcOrFssId: string;

    /**
     * The type of facility (IE: AIRPORT)
     */
    public readonly serviceSiteType: string;

    /**
     * The name of the tower or facility (IE: BOEING)
     */
    public readonly towerOrComFreq: string;

    /**
     * The name of the approach facility (IE: SEATTLE)
     */
    public readonly approachFreq: string;

    /**
     * The frequency to tune to
     */
    public readonly frequency: string;

    /**
     * The intention of the frequency (IE: CTAF, GND)
     */
    public readonly frequencyName: string;

    /**
     * Any special notes about the frequency
     */
    public readonly remarks: string;

    /**
     * The location of the facility
     */
    public readonly coordinates: Coordinate;

    public constructor(
        tokens: string[]
    ) {
        const lat: number = parseFloat(tokens[10]);
        const lon: number = parseFloat(tokens[11]);
        this.coordinates = new Coordinate(lon, lat);

        this.facilityId = this.cleanString(tokens[1]);
        this.facilityName = this.cleanString(tokens[2]);
        this.facilityType = this.cleanString(tokens[3]);
        this.artcOrFssId = this.cleanString(tokens[4]);
        this.serviceSiteType = this.cleanString(tokens[9]);
        this.towerOrComFreq = this.cleanString(tokens[15]);
        this.approachFreq = this.cleanString(tokens[16]);
        this.frequency = this.cleanString(tokens[17]);

        /*
        LCL/P local control tower / primary
        LCL/S local control tower / secondary
        GND/P ground / primary
        GND/S ground / secondary
        CD/P clearance delivery / primary
        */

        this.frequencyName = this.cleanString(tokens[19]);
        this.remarks = this.cleanString(tokens[20]);
    }

    private cleanString(
        token: string
    ): string {
        return token.replace(/['"]/g, '');
    }
}