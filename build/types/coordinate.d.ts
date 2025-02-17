/**
 * GPS coordinates.
 */
export declare class Coordinate {
    /**
     * The East to West cooridinate.
     *
     * @type {number}
     * @memberof Coordinate
     */
    readonly longitude: number;
    /**
     * The North to South coordinate.
     *
     * @type {number}
     * @memberof Coordinate
     */
    readonly latitude: number;
    /**
     * Get the coordinate as a log/print friendly string.
     * @returns A log/print friendly string of the coordinate.
     */
    toString(): string;
    /**
     * Form a coordinate
     * @param longitude The East to West cooridinate.
     * @param latitude The North to South coordinate.
     */
    constructor(longitude: number, latitude: number);
}
