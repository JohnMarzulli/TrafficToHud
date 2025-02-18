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
