import { Coordinate } from "./coordinate";
/**
 * Define the two opposite corners of a block of space.
 */
export declare class CoordinateBoundaries {
    /**
     *The most NorthWestern coordinate of the boundary
     *
     * @type {Coordinate}
     * @memberof CoordinateBoundaries
     */
    readonly northWestern: Coordinate;
    /**
     *The most SouthEastern coordinate of the boundary
     *
     * @type {Coordinate}
     * @memberof CoordinateBoundaries
     */
    readonly southEastern: Coordinate;
    /**
     * Get the coordinate bounds as text.
     * @returns
     */
    toString(): string;
    /**
     * Create a new GPS boundary box.
     * @param northWestern The most NW corner of the box.
     * @param southEastern The most SE corner of the box.
     */
    constructor(northWestern: Coordinate, southEastern: Coordinate);
}
