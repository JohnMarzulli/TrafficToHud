"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAirports = exports.getAirports = void 0;
var fs = require("fs");
var path = require("path");
var airport_1 = require("../types/airport");
var coordinate_1 = require("../types/coordinate");
/**
 * Get a list of any nearby airports
 * @param req The REST request
 * @returns A list of any airports within the given radius of the given location.
 */
function getAirports(req) {
    var url = new URL(req.url);
    var queryParams = new URLSearchParams(url.search);
    // Get the value of the specified parameter
    var lat = parseFloat(queryParams.get("lat"));
    var lon = parseFloat(queryParams.get("lon"));
    var distance = parseFloat(queryParams.get("distance"));
    var location = new coordinate_1.Coordinate(lon, lat);
    return getAirportsWithinDistance(location, distance);
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
        var lat = parseFloat(tokens[0]);
        var lon = parseFloat(tokens[1]);
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
function getDistance(firstPoint, otherPoint) {
    var R = 6371e3; // Earth's mean radius in meters
    // Convert degrees to radians
    var toRadians = function (degrees) { return degrees * (Math.PI / 180); };
    var lat1 = toRadians(firstPoint.latitude);
    var lat2 = toRadians(otherPoint.latitude);
    var deltaLat = toRadians(otherPoint.latitude - firstPoint.latitude);
    var deltaLon = toRadians(otherPoint.longitude - firstPoint.longitude);
    var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in meters
}
function getAirportsWithinDistance(location, distance) {
    return airports.filter(function (airport) {
        return getDistance(location, airport.coordinates) <= distance;
    });
}
var airports = [];
var airportsByIdent = new Map();
//# sourceMappingURL=airports.js.map