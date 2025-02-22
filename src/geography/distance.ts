"use strict";

import * as assert from 'assert';
import { Coordinate } from "../types/coordinate";

const StatuteNauticalConversionFactor: number = 0.868976;

/**
 * Returns the distance between two coordinates in STATUTE MILES
 * @param firstPoint The first location to get distance between
 * @param otherPoint The second location to get distance between
 * @returns The distance between the two points in STATUTE MILES
 */
export function getDistance(
    firstPoint: Coordinate,
    otherPoint: Coordinate
): number {
    const r = 3956; // Earth's mean radius in statute miles

    // Convert degrees to radians
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const firstLat = toRadians(firstPoint.latitude);
    const otherLat = toRadians(otherPoint.latitude);
    const firstLon = toRadians(firstPoint.longitude);
    const otherLon = toRadians(otherPoint.longitude);
    const deltaLon = otherLon - firstLon;
    const deltaLat = otherLat - firstLat;

    const a = Math.sin(deltaLat / 2) ** 2 + Math.cos(firstLat) * Math.cos(otherLat) * Math.sin(deltaLon / 2) ** 2;
    const c = 2 * Math.asin(Math.sqrt(a));

    return r * c; // Distance in meters
}

/**
 * Convert statute miles to nautical miles.
 * @param distance The distance in STATUTE MILES
 * @returns A distance in Nautical Miles
 */
export function getStatuteMilesToNauticalMiles(
    distance: number
): number {
    return distance * StatuteNauticalConversionFactor;
}

/**
 * Convert nautical miles to statute miles.
 * @param distance The distance in NAUTICAL MILES
 * @returns A distance in STATUTE Miles
 */
export function getNauticalMilesToStatuteMiles(
    distance: number
): number {
    return distance / StatuteNauticalConversionFactor;
}