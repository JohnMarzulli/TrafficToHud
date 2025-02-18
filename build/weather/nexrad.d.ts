import { CoordinateBoundaries } from "../types/boundaries";
/**
 * Stores reflectivity maps and provides a way to retrieve them.
 */
export declare class ReflectivityRadar {
    /**
     * Retrieve ALL of the reflectivity maps.
     * @param req The REST request bundle.
     * @returns A set of all known reflectivity blocks.
     */
    static getReflectivity(req: Request): any;
    /**
     * Add or update reflectivity block report to the store.
     * @param report The report to add or update.
     */
    static addReport(report: Reflectivity): void;
    private static removeOldReports;
    private static maxReportAgeSeconds;
    private static mapByReferenceId;
    private static lastGcTime;
}
/**
 * Holds the data for a reflectivity block.
 */
export declare class Reflectivity {
    /**
     *When was the report recieved?
     *
     * @type {number}
     * @memberof Reflectivity
     */
    readonly reportTime: number;
    /**
     * What is the block Id of this data?
     *
     * @type {number}
     * @memberof Reflectivity
     */
    readonly globalBlockReferenceId: number;
    /**
     * The NW and SE corners that are defined by the block Id.
     *
     * @type {CoordinateBoundaries}
     * @memberof Reflectivity
     */
    readonly boundaries: CoordinateBoundaries;
    /**
     * The reflectivity data.
     *
     * @type {number[][]}
     * @memberof Reflectivity
     */
    readonly reflectivity: number[][];
    /**
     * How old is the report?
     * @returns The age of the report in seconds.
     */
    getReportAgeSeconds(): number;
    /**
     * Build NEXRAD data from an uplink package.
     * @param globalBlockReferenceId The block Id that defines the coverage region.
     * @param boundaries The coordinate boundaries of the coverage region.
     * @param bins The bin data for the coverage blocks.
     */
    constructor(globalBlockReferenceId: number, boundaries: CoordinateBoundaries, bins: number[]);
}
