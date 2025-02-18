/**
 * List of flight rule categories
 */
export declare enum FlightRules {
    /**
     * Unable to decode the flight rules
     */
    unknown = "UNK",
    /**
     * Visual Flight Rules
     */
    vfr = "VFR",
    /**
     * Marginal Visual Flight Rules
     */
    mvfr = "mvfr",
    /**
     * Instrument Flight Rules
     */
    ifr = "ifr",
    /**
     * Low Instrument Flight Rules
     */
    lifr = "lifr"
}
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
 * Add a report to the current known metars.
 * @param report The report to add.
 */
export declare function addReport(report: Metar): void;
/**
 * Get any reports for the given station/
 * @param station The station to get the metar for.
 * @returns The report, if any were found. Otherwise returns `null`.
 */
export declare function getReport(station: string): Metar | null;
