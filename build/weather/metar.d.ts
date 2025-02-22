import { FlightRules } from './flight-rules';
/**
 * Object to hold and decode a weather report.
 */
export declare class Metar {
    /**
     * What are the flight rules based on the METAR?
     *
     * @type {FlightRules}
     * @memberof Metar
     */
    readonly flightRules: FlightRules;
    /**
     * Which station issued the METAR?
     *
     * @type {string}
     * @memberof Metar
     */
    readonly station: string;
    /**
     * The raw METAR
     *
     * @type {string}
     * @memberof Metar
     */
    readonly metar: string;
    constructor(report: string);
}
/**
 * For a METAR, what is the flight category of the VISBILITY
 * @param metar The METAR to analyze for visbility
 * @returns The flight category based on *only* the visibility
 */
export declare function getVisibilityCategory(metar: string): FlightRules;
/**
 * For a METAR, what is the flight category of the CEILING
 * @param metar The METAR to analyze for the ceiling
 * @returns The flight category based on *only* the ceiling
 */
export declare function getCeilingCategory(metar: string): FlightRules;
/**
 * Get the station that reported the METAR
 * @param metar The metar to extract the reporting station from.
 * @returns The station found, otherwise "UNKNOWN".
 */
export declare function getStation(metar: string): string;
/**
 * Given a METAR, what are the flight rules for the weather?
 * @param metar The METAR to extract the flight rules from.
 * @returns The flight rules for the station based on the METAR.
 */
export declare function getFlightRules(metar: string): FlightRules;
