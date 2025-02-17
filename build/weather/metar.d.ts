/**
 * List of flight rule categories
 */
export declare enum FlightRules {
    unknown = "UNK",
    vfr = "VFR",
    mvfr = "mvfr",
    ifr = "ifr",
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
