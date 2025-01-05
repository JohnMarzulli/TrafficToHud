import { Coordinate } from "./coordinate";

export class CoordinateBoundaries {
    public readonly northWestern: Coordinate;
    public readonly southEastern: Coordinate;

    public toString(): string {
        return `[northWestern=${this.northWestern}, southEastern=${this.southEastern}]`;
    }

    public constructor(
        northWestern: Coordinate,
        southEastern: Coordinate
    ) {
        this.northWestern = northWestern;
        this.southEastern = southEastern;
    }
}