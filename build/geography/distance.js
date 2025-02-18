"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNauticalMilesToStatuteMiles = exports.getStatuteMilesToNauticalMiles = exports.getDistance = void 0;
var assert = require("assert");
var coordinate_1 = require("../types/coordinate");
var StatuteNauticalConversionFactor = 0.868976;
/**
 * Returns the distance between two coordinates in STATUTE MILES
 * @param firstPoint The first location to get distance between
 * @param otherPoint The second location to get distance between
 * @returns The distance between the two points in STATUTE MILES
 */
function getDistance(firstPoint, otherPoint) {
    var r = 3956; // Earth's mean radius in statute miles
    // Convert degrees to radians
    var toRadians = function (degrees) { return degrees * (Math.PI / 180); };
    var firstLat = toRadians(firstPoint.latitude);
    var otherLat = toRadians(otherPoint.latitude);
    var firstLon = toRadians(firstPoint.longitude);
    var otherLon = toRadians(otherPoint.longitude);
    var deltaLon = otherLon - firstLon;
    var deltaLat = otherLat - firstLat;
    var a = Math.pow(Math.sin(deltaLat / 2), 2) + Math.cos(firstLat) * Math.cos(otherLat) * Math.pow(Math.sin(deltaLon / 2), 2);
    var c = 2 * Math.asin(Math.sqrt(a));
    return r * c; // Distance in meters
}
exports.getDistance = getDistance;
/**
 * Convert statute miles to nautical miles.
 * @param distance The distance in STATUTE MILES
 * @returns A distance in Nautical Miles
 */
function getStatuteMilesToNauticalMiles(distance) {
    return distance * StatuteNauticalConversionFactor;
}
exports.getStatuteMilesToNauticalMiles = getStatuteMilesToNauticalMiles;
/**
 * Convert nautical miles to statute miles.
 * @param distance The distance in NAUTICAL MILES
 * @returns A distance in STATUTE Miles
 */
function getNauticalMilesToStatuteMiles(distance) {
    return distance / StatuteNauticalConversionFactor;
}
exports.getNauticalMilesToStatuteMiles = getNauticalMilesToStatuteMiles;
function getDelta(actualDistance, expectedDistance) {
    return Math.abs(actualDistance - expectedDistance);
}
function testGetDistance() {
    function isWithInLimits(firstLocation, secondLocation, expectedDistance) {
        var foundDistance = getDistance(firstLocation, secondLocation);
        var delta = getDelta(foundDistance, expectedDistance);
        var epsilon = expectedDistance * 0.01;
        return delta < epsilon;
    }
    var seatac = new coordinate_1.Coordinate(122.3086, 47.4484);
    var arlington = new coordinate_1.Coordinate(122.1522, 48.1608);
    var portland = new coordinate_1.Coordinate(122.5917, 45.5853);
    var oshkosh = new coordinate_1.Coordinate(44.1524, 40.3001);
    assert.strictEqual(isWithInLimits(seatac, arlington, 49.75), true);
    assert.strictEqual(isWithInLimits(arlington, seatac, 49.75), true);
    assert.strictEqual(isWithInLimits(portland, arlington, 179.16), true);
    assert.strictEqual(isWithInLimits(arlington, portland, 179.16), true);
    assert.strictEqual(isWithInLimits(oshkosh, arlington, 3731.73), true);
    assert.strictEqual(isWithInLimits(arlington, oshkosh, 3731.73), true);
    console.log("Passed GPS distance tests.");
}
function testStatuteToNauticalConversion() {
    function isWithinLimits(expectedDistance, foundDistance) {
        var delta = getDelta(foundDistance, expectedDistance);
        var epsilon = expectedDistance * 0.001;
        return delta < epsilon;
    }
    assert.strictEqual(isWithinLimits(3242.78, getStatuteMilesToNauticalMiles(3731.73)), true);
    console.log("Passed SM to NM tests.");
}
function testNauticalToStatuteConversion() {
    function isWithinLimits(expectedDistance, foundDistance) {
        var delta = getDelta(foundDistance, expectedDistance);
        var epsilon = expectedDistance * 0.001;
        return delta < epsilon;
    }
    assert.strictEqual(isWithinLimits(3731.73, getNauticalMilesToStatuteMiles(3242.78)), true);
    console.log("Passed NM to SM tests.");
}
testGetDistance();
testStatuteToNauticalConversion();
testNauticalToStatuteConversion();
//# sourceMappingURL=distance.js.map