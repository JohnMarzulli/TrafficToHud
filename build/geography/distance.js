"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNauticalMilesToStatuteMiles = exports.getStatuteMilesToNauticalMiles = exports.getDistance = void 0;
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
//# sourceMappingURL=distance.js.map