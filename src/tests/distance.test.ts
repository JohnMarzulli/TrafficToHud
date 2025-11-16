"use strict";

import * as assert from 'assert';
import { getDistance, getNauticalMilesToStatuteMiles, getStatuteMilesToNauticalMiles } from '../geography/distance';
import { Coordinate } from '../types/coordinate';

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