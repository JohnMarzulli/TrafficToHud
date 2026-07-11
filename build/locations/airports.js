"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAirportsWithinDistance = exports.loadAirports = exports.getAirportDataStatus = exports.getAirports = void 0;
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
    var _a, _b, _c;
    try {
        var requestHost = 'localhost';
        if (req && req.headers && req.headers.get('host')) {
            requestHost = req.headers.get('host');
        }
        var host = "http://" + requestHost;
        var fullUrl = new URL(req.url, host);
        var queryParams = new URLSearchParams(fullUrl.search);
        // Get the value of the specified parameter
        var lat = parseFloat((_a = queryParams.get("lat")) !== null && _a !== void 0 ? _a : "0");
        var lon = parseFloat((_b = queryParams.get("lon")) !== null && _b !== void 0 ? _b : "0");
        var distance = parseFloat((_c = queryParams.get("dist")) !== null && _c !== void 0 ? _c : "0");
        var location_1 = new coordinate_1.Coordinate(lon, lat);
        return getAirportsWithinDistance(location_1, distance);
    }
    catch (_d) {
        return [];
    }
}
exports.getAirports = getAirports;
/**
 * Returns the expiration dates of the loaded data.
 * @param req the incoming REST request (ignored)
 * @returns The set of expiration dates for the loaded airport data.
 */
function getAirportDataStatus(req) {
    try {
        return expirations;
    }
    catch (_a) {
        return [];
    }
}
exports.getAirportDataStatus = getAirportDataStatus;
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
exports.getAirportsWithinDistance = getAirportsWithinDistance;
function getExpirations() {
    var expirationsPath = path.resolve(__dirname, '../../data/expirations.json');
    var expirationsContent = fs.readFileSync(expirationsPath, 'utf-8');
    var expirations = JSON.parse(expirationsContent);
    var airportsKey = "Airports.csv";
    return {
        expiration: expirations[airportsKey] ? expirations[airportsKey] : new Date().toISOString()
    };
}
var airports = [];
var airportsByIdent = new Map();
var expirations = getExpirations();
//# sourceMappingURL=airports.js.map