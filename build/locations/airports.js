"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAirportsFrequenciesWithinDistance = exports.getAirportsWithinDistance = exports.loadFrequencies = exports.loadAirports = exports.getAirportDataStatus = exports.getFrequencies = exports.getAirports = void 0;
var fs = require("fs");
var path = require("path");
var distance_1 = require("../geography/distance");
var airport_1 = require("../types/airport");
var airportFrequencies_1 = require("../types/airportFrequencies");
var coordinate_1 = require("../types/coordinate");
/**
 * Get a list of any nearby airports
 * @param req The REST request
 * @returns A list of any airports within the given radius of the given location.
 */
function getAirports(req) {
    try {
        // Get the value of the specified parameter
        var distance = getDistanceFromRequest(req);
        var location_1 = getLatLonFromRequest(req);
        return getAirportsWithinDistance(location_1, distance);
    }
    catch (error) {
        console.error("Error in getAirports:", error);
        return [];
    }
}
exports.getAirports = getAirports;
/**
 * Find any frequencies within the given radius (STATUTE MILES) of the given location
 * @param req
 * @returns A dictionary with the facility identifier as the key. This indexes to a list of the facility's frequencies.
 */
function getFrequencies(req) {
    try {
        var distance = getDistanceFromRequest(req);
        var location_2 = getLatLonFromRequest(req);
        return getAirportsFrequenciesWithinDistance(location_2, distance);
    }
    catch (_a) {
        return {};
    }
}
exports.getFrequencies = getFrequencies;
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
 * Load the frequencies data from the FAA CSV file.
 */
function loadFrequencies() {
    if (airportFrequencies.size > 0) {
        return;
    }
    var lines = getCsvDataFileLines('FRQ.csv');
    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
        var line = lines_2[_i];
        var trimmedLine = line.trim();
        if (trimmedLine.length < 10) {
            continue;
        }
        var tokens = trimmedLine.split(',');
        if (tokens.length < 10) {
            continue;
        }
        var frequencyInfo = new airportFrequencies_1.AirportFrequencies(tokens);
        if (!airportFrequencies.has(frequencyInfo.facilityId)) {
            airportFrequencies.set(frequencyInfo.facilityId, []);
        }
        airportFrequencies.get(frequencyInfo.facilityId).push(frequencyInfo);
    }
}
exports.loadFrequencies = loadFrequencies;
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
/**
 * Find a list of frequencies with in the given radius from the given location.
 * @param location The location to use as our center point of search.
 * @param distance The RADIUS to search, given in STATUTE MILES.
 * @returns A dictionary with the facility identifier as the key. This indexes to a list of the facility's frequencies.
 */
function getAirportsFrequenciesWithinDistance(location, distance) {
    var foundAirportFrequencies = {};
    airportFrequencies.forEach(function (frequencies, ident) {
        var foundDistance = distance_1.getDistance(location, frequencies[0].coordinates);
        if (foundDistance <= distance) {
            var voiceFreqs = getValidFrequencies(frequencies);
            if (voiceFreqs.length > 0) {
                foundAirportFrequencies[ident] = voiceFreqs;
            }
        }
    });
    return foundAirportFrequencies;
}
exports.getAirportsFrequenciesWithinDistance = getAirportsFrequenciesWithinDistance;
function getValidFrequencies(allFreqs) {
    var voiceFreqs = [];
    for (var _i = 0, allFreqs_1 = allFreqs; _i < allFreqs_1.length; _i++) {
        var freq = allFreqs_1[_i];
        if (freq.facilityType === 'NAVAID') {
            continue;
        }
        if (freq.coordinates.latitude === undefined || freq.coordinates.latitude === null || Number.isNaN(freq.coordinates.latitude)) {
            continue;
        }
        voiceFreqs.push(freq);
    }
    return voiceFreqs;
}
function getCsvDataFileLines(fileShortName) {
    var filePath = path.resolve(__dirname, "../../data/" + fileShortName);
    var fileContent = fs.readFileSync(filePath, 'utf-8');
    return fileContent.split('\n').slice(1);
}
function getExpirations() {
    var expirationsPath = path.resolve(__dirname, '../../data/expirations.json');
    var expirationsContent = fs.readFileSync(expirationsPath, 'utf-8');
    var expirations = JSON.parse(expirationsContent);
    var airportsKey = "Airports.csv";
    return {
        expiration: expirations[airportsKey] ? expirations[airportsKey] : new Date().toISOString()
    };
}
function getLatLonFromRequest(req) {
    var _a, _b, _c;
    var queryString = (_a = req.originalUrl.split("?")[1]) !== null && _a !== void 0 ? _a : "";
    var queryParams = new URLSearchParams(queryString);
    // Get the value of the specified parameter
    var lat = parseFloat((_b = queryParams.get("lat")) !== null && _b !== void 0 ? _b : "0");
    var lon = parseFloat((_c = queryParams.get("lon")) !== null && _c !== void 0 ? _c : "0");
    var location = new coordinate_1.Coordinate(lon, lat);
    return location;
}
function getDistanceFromRequest(req) {
    var _a, _b;
    var queryString = (_a = req.originalUrl.split("?")[1]) !== null && _a !== void 0 ? _a : "";
    var queryParams = new URLSearchParams(queryString);
    // Get the value of the specified parameter
    var distance = parseFloat((_b = queryParams.get("dist")) !== null && _b !== void 0 ? _b : "0");
    return distance;
}
var airports = [];
var airportsByIdent = new Map();
var airportFrequencies = new Map();
var expirations = getExpirations();
//# sourceMappingURL=airports.js.map