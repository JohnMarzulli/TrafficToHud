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

function getDelta(
    actualDistance: number,
    expectedDistance: number
): number {
    return Math.abs(actualDistance - expectedDistance);
}

function testGetDistance(): void {
    function isWithInLimits(
        firstLocation: Coordinate,
        secondLocation: Coordinate,
        expectedDistance: number
    ) {
        const foundDistance = getDistance(firstLocation, secondLocation);
        const delta: number = getDelta(foundDistance, expectedDistance);
        const epsilon: number = expectedDistance * 0.01;

        return delta < epsilon;
    }

    const seatac: Coordinate = new Coordinate(122.3086, 47.4484);
    const arlington: Coordinate = new Coordinate(122.1522, 48.1608);
    const portland: Coordinate = new Coordinate(122.5917, 45.5853);
    const oshkosh: Coordinate = new Coordinate(44.1524, 40.3001);

    assert.strictEqual(isWithInLimits(seatac, arlington, 49.75), true);
    assert.strictEqual(isWithInLimits(arlington, seatac, 49.75), true);

    assert.strictEqual(isWithInLimits(portland, arlington, 179.16), true);
    assert.strictEqual(isWithInLimits(arlington, portland, 179.16), true);

    assert.strictEqual(isWithInLimits(oshkosh, arlington, 3731.73), true);
    assert.strictEqual(isWithInLimits(arlington, oshkosh, 3731.73), true);

    console.log("PASSED: GPS distance tests.");
}

function testStatuteToNauticalConversion(): void {
    function isWithinLimits(
        expectedDistance: number,
        foundDistance: number
    ): boolean {
        const delta: number = getDelta(foundDistance, expectedDistance);
        const epsilon: number = expectedDistance * 0.001;

        return delta < epsilon;
    }

    assert.strictEqual(isWithinLimits(3242.78, getStatuteMilesToNauticalMiles(3731.73)), true);

    console.log("PASSED: SM to NM tests.");
}

function testNauticalToStatuteConversion(): void {
    function isWithinLimits(
        expectedDistance: number,
        foundDistance: number
    ): boolean {
        const delta: number = getDelta(foundDistance, expectedDistance);
        const epsilon: number = expectedDistance * 0.001;

        return delta < epsilon;
    }

    assert.strictEqual(isWithinLimits(3731.73, getNauticalMilesToStatuteMiles(3242.78)), true);

    console.log("PASSED: NM to SM tests.");
}

testGetDistance();
testStatuteToNauticalConversion();
testNauticalToStatuteConversion();