"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAirportsFrequenciesWithinDistance = exports.getAirportsWithinDistance = exports.loadFrequencies = exports.loadAirports = exports.getFrequencies = exports.getAirports = void 0;
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
        var distance = getDistanceFromRequest(req);
        var location_1 = getLatLonFromRequest(req);
        return getAirportsWithinDistance(location_1, distance);
    }
    catch (_a) {
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
 * Loads the list of airports from the FAA data.
 */
function loadAirports() {
    if (airports.length > 0) {
        return;
    }
    var lines = getCsvDataFileLines('Airports.csv');
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
    var lines = getCsvDataFileLines('nasr/FRQ.csv');
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
        if (!(frequencyInfo.facilityId in airportFrequencies)) {
            airportFrequencies[frequencyInfo.facilityId] = [];
        }
        airportFrequencies[frequencyInfo.facilityId].push(frequencyInfo);
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
    for (var ident in airportFrequencies) {
        var foundDistance = distance_1.getDistance(location, airportFrequencies[ident][0].coordinates);
        if (foundDistance <= distance) {
            var voiceFreqs = getValidFrequencies(airportFrequencies[ident]);
            if (voiceFreqs.length > 0) {
                foundAirportFrequencies[ident] = airportFrequencies[ident];
            }
        }
    }
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
function getLatLonFromRequest(req) {
    var host = "http://" + req.headers['host'];
    var fullUrl = new URL(req.url, host);
    var queryParams = new URLSearchParams(fullUrl.search);
    // Get the value of the specified parameter
    var lat = parseFloat(queryParams.get("lat"));
    var lon = parseFloat(queryParams.get("lon"));
    return new coordinate_1.Coordinate(lon, lat);
}
function getDistanceFromRequest(req) {
    var host = "http://" + req.headers['host'];
    var fullUrl = new URL(req.url, host);
    var queryParams = new URLSearchParams(fullUrl.search);
    return parseFloat(queryParams.get("dist"));
}
var airports = [];
var airportFrequencies = new Map();
var airportsByIdent = new Map();
//# sourceMappingURL=airports.js.map