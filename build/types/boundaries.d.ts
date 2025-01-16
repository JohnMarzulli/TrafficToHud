import { Coordinate } from "./coordinate";
export declare class CoordinateBoundaries {
    readonly northWestern: Coordinate;
    readonly southEastern: Coordinate;
    toString(): string;
    constructor(northWestern: Coordinate, southEastern: Coordinate);
}
