/**
 * Get a list of any nearby airports
 * @param req The REST request
 * @returns A list of any airports within the given radius of the given location.
 */
export declare function getAirports(req: Request): any;
/**
 * Loads the list of airports from the FAA data.
 */
export declare function loadAirports(): void;
