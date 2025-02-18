import { Coordinate } from "../types/coordinate";
/**
 * Returns the distance between two coordinates in STATUTE MILES
 * @param firstPoint The first location to get distance between
 * @param otherPoint The second location to get distance between
 * @returns The distance between the two points in STATUTE MILES
 */
export declare function getDistance(firstPoint: Coordinate, otherPoint: Coordinate): number;
export declare function getStatuteMilesToNauticalMiles(distance: number): number;
export declare function getNauticalMilesToStatuteMiles(distance: number): number;
