"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAirports = exports.getAirports = void 0;
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var distance_1 = require("../geography/distance");
var airport_1 = require("../types/airport");
var coordinate_1 = require("../types/coordinate");
/**
 * Get a list of any nearby airports
 * @param req The REST request
 * @returns A list of any airports within the given radius of the given location.
 */
function getAirports(req) {
    try {
        var host = "http://" + req.headers['host'];
        var fullUrl = new URL(req.url, host);
        var queryParams = new URLSearchParams(fullUrl.search);
        // Get the value of the specified parameter
        var lat = parseFloat(queryParams.get("lat"));
        var lon = parseFloat(queryParams.get("lon"));
        var distance = parseFloat(queryParams.get("dist"));
        var location_1 = new coordinate_1.Coordinate(lon, lat);
        return getAirportsWithinDistance(location_1, distance);
    }
    catch (_a) {
        return [];
    }
}
exports.getAirports = getAirports;
/**
 * Loads the list of airports from the FAA data.
 */
function loadAirports() {
    if (airports.length > 0) {
        return;
    }
    var filePath = path.resolve(__dirname, '../../data/Airports.csv');
    var fileContent = fs.readFileSync(filePath, 'utf-8');
    var lines = fileContent.split('\n').slice(1);
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        if (line.length < 10) {
            continue;
        }
        var tokens = line.split(',');
        var lat = parseFloat(tokens[1]);
        var lon = parseFloat(tokens[0]);
        var ident = tokens[4].trim();
        var airportName = tokens[5].trim();
        var icao = tokens[9].trim();
        var airportType = tokens[10].trim();
        var isPrivate = parseInt(tokens[15]) == 1;
        var key = icao.length > 0 ? icao : ident;
        var newAirport = new airport_1.Airport(new coordinate_1.Coordinate(lon, lat), key, airportName, airportType, !isPrivate);
        airportsByIdent.set(key, newAirport);
        airports.push(newAirport);
    }
}
exports.loadAirports = loadAirports;
/**
 * Get any airports that are within a given distance (STATUTE MILES)
 * @param location The location to find airports within a radius of
 * @param distance The maximum radius in STATUTE MILES
 * @returns Any airports found within the given distance.
 */
function getAirportsWithinDistance(location, distance) {
    var foundAirports = airports
        .filter(function (airport) { return airport.airportType === "AD"; })
        .filter(function (airport) {
        var foundDistance = distance_1.getDistance(location, airport.coordinates);
        return foundDistance <= distance;
    });
    return foundAirports;
}
var airports = [];
var airportsByIdent = new Map();
function hasAirport(airports, ident) {
    return airports.filter(function (airport) { return airport.ident === ident; }).length >= 1;
}
function testGetAirportsByDistance() {
    loadAirports();
    var foundAirports = getAirportsWithinDistance(new coordinate_1.Coordinate(-122.15, 48.16), 20.0);
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
//# sourceMappingURL=airports.js.map