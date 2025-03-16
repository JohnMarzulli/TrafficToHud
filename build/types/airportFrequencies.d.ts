import { Coordinate } from "./coordinate";
/**
 * Holds information about frequencies as published by the FAA
 */
export declare class AirportFrequencies {
    /**
     * The ID of the facility. Normally the 3 leter airport code (IE: AWO)
     */
    readonly facilityId: string;
    /**
     * The human readable name of the facility. (IE: Arlington Municipal)
     */
    readonly facilityName: string;
    /**
     * The type of facility. (IE: NON-ATC for a non towered airport)
     */
    readonly facilityType: string;
    /**
     * A Flight Service Id if there is one. (90% blank)
     */
    readonly artcOrFssId: string;
    /**
     * The type of facility (IE: AIRPORT)
     */
    readonly serviceSiteType: string;
    /**
     * The name of the tower or facility (IE: BOEING)
     */
    readonly towerOrComFreq: string;
    /**
     * The name of the approach facility (IE: SEATTLE)
     */
    readonly approachFreq: string;
    /**
     * The frequency to tune to
     */
    readonly frequency: string;
    /**
     * The intention of the frequency (IE: CTAF, GND)
     */
    readonly frequencyName: string;
    /**
     * Any special notes about the frequency
     */
    readonly remarks: string;
    /**
     * The location of the facility
     */
    readonly coordinates: Coordinate;
    constructor(tokens: string[]);
    private cleanString;
}
