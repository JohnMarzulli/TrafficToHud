"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var airports_1 = require("../locations/airports");
var coordinate_1 = require("../types/coordinate");
function hasAirport(airports, ident) {
    return airports.filter(function (airport) { return airport.ident === ident; }).length >= 1;
}
function testGetAirportsByDistance() {
    airports_1.loadAirports();
    var foundAirports = airports_1.getAirportsWithinDistance(new coordinate_1.Coordinate(-122.15, 48.16), 20.0);
    assert.strictEqual(foundAirports.length, 12);
    assert.strictEqual(hasAirport(foundAirports, "KAWO"), true);
    assert.strictEqual(hasAirport(foundAirports, "KPAE"), true);
    assert.strictEqual(hasAirport(foundAirports, "W10"), true);
    assert.strictEqual(hasAirport(foundAirports, "S43"), true);
    assert.strictEqual(hasAirport(foundAirports, "W10"), true);
    assert.strictEqual(hasAirport(foundAirports, "SEA"), false);
    assert.strictEqual(hasAirport(foundAirports, "BVS"), false);
    console.log("PASSED: Airport search tests.");
}
testGetAirportsByDistance();
//# sourceMappingURL=airports.test.js.map