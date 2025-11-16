import { Coordinate } from "./coordinate";

/**
 * Define the two opposite corners of a block of space.
 */
export class CoordinateBoundaries {
    /**
     * How much does each bin advance in latitude.
     *
     * @type {number}
     * @memberof CoordinateBoundaries
     */
    public readonly latSize: number;

    /**
     * How much does each bin advance in longitude.
     *
     * @type {number}
     * @memberof CoordinateBoundaries
     */
    public readonly lonSize: number;

    /**
     *The most NorthWestern coordinate of the boundary
     *
     * @type {Coordinate}
     * @memberof CoordinateBoundaries
     */
    public readonly northWestern: Coordinate;

    /**
     *The most SouthEastern coordinate of the boundary
     *
     * @type {Coordinate}
     * @memberof CoordinateBoundaries
     */
    public readonly southEastern: Coordinate;

    /**
     * Get the coordinate bounds as text.
     * @returns 
     */
    public toString(): string {
        return `[northWestern=${this.northWestern}, southEastern=${this.southEastern}]`;
    }

    /**
     * Create a new GPS boundary box.
     * @param northWestern The most NW corner of the box.
     * @param southEastern The most SE corner of the box.
     */
    public constructor(
        latSize: number,
        lonSize: number,
        northWestern: Coordinate,
        southEastern: Coordinate
    ) {
        this.latSize = latSize;
        this.lonSize = lonSize;
        this.northWestern = northWestern;
        this.southEastern = southEastern;
    }
}