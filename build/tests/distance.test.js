"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var distance_1 = require("../geography/distance");
var coordinate_1 = require("../types/coordinate");
function getDelta(actualDistance, expectedDistance) {
    return Math.abs(actualDistance - expectedDistance);
}
function testGetDistance() {
    function isWithInLimits(firstLocation, secondLocation, expectedDistance) {
        var foundDistance = distance_1.getDistance(firstLocation, secondLocation);
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
    console.log("PASSED: GPS distance tests.");
}
function testStatuteToNauticalConversion() {
    function isWithinLimits(expectedDistance, foundDistance) {
        var delta = getDelta(foundDistance, expectedDistance);
        var epsilon = expectedDistance * 0.001;
        return delta < epsilon;
    }
    assert.strictEqual(isWithinLimits(3242.78, distance_1.getStatuteMilesToNauticalMiles(3731.73)), true);
    console.log("PASSED: SM to NM tests.");
}
function testNauticalToStatuteConversion() {
    function isWithinLimits(expectedDistance, foundDistance) {
        var delta = getDelta(foundDistance, expectedDistance);
        var epsilon = expectedDistance * 0.001;
        return delta < epsilon;
    }
    assert.strictEqual(isWithinLimits(3731.73, distance_1.getNauticalMilesToStatuteMiles(3242.78)), true);
    console.log("PASSED: NM to SM tests.");
}
testGetDistance();
testStatuteToNauticalConversion();
testNauticalToStatuteConversion();
//# sourceMappingURL=distance.test.js.map