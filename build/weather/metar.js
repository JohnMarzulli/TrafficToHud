"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFlightRules = exports.getStation = exports.getCeilingCategory = exports.getVisibilityCategory = exports.Metar = void 0;
var flight_rules_1 = require("./flight-rules");
var unknown = "Unknown";
/**
 * Object to hold and decode a weather report.
 */
var Metar = /** @class */ (function () {
    function Metar(report) {
        this.metar = report.trim();
        this.station = getStation(this.metar);
        this.flightRules = getFlightRules(this.metar);
        // TODO: Add a report time so we can prune this.
    }
    return Metar;
}());
exports.Metar = Metar;
/**
 * For a METAR, what is the flight category of the VISBILITY
 * @param metar The METAR to analyze for visbility
 * @returns The flight category based on *only* the visibility
 */
function getVisibilityCategory(metar) {
    var _a, _b;
    var visbilityText = (_b = (_a = getVisibility(metar)) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === null || _b === void 0 ? void 0 : _b.replace("SM", "");
    if (visbilityText == null) {
        return flight_rules_1.FlightRules.vfr;
    }
    var distance = 0;
    if (visbilityText.includes('/')) {
        var wholeAndFraction = visbilityText.split(' ');
        var fractionIndex = wholeAndFraction.length == 2 ? 1 : 0;
        var fraction = wholeAndFraction[fractionIndex].split('/');
        var wholeNumber = wholeAndFraction.length == 2 ? parseInt(wholeAndFraction[0], 10) : 0;
        distance = wholeNumber + (parseInt(fraction[0]) / parseInt(fraction[1]));
    }
    else {
        distance = parseInt(visbilityText, 10);
    }
    if (distance < 1) {
        return flight_rules_1.FlightRules.lifr;
    }
    if (distance < 3) {
        return flight_rules_1.FlightRules.ifr;
    }
    if (distance <= 5) {
        return flight_rules_1.FlightRules.mvfr;
    }
    return flight_rules_1.FlightRules.vfr;
}
exports.getVisibilityCategory = getVisibilityCategory;
/**
 * For a METAR, what is the flight category of the CEILING
 * @param metar The METAR to analyze for the ceiling
 * @returns The flight category based on *only* the ceiling
 */
function getCeilingCategory(metar) {
    var ceiling = getCeiling(metar);
    if (ceiling <= 500) {
        return flight_rules_1.FlightRules.lifr;
    }
    else if (ceiling <= 1000) {
        return flight_rules_1.FlightRules.ifr;
    }
    else if (ceiling < 3000) {
        return flight_rules_1.FlightRules.mvfr;
    }
    return flight_rules_1.FlightRules.vfr;
}
exports.getCeilingCategory = getCeilingCategory;
/**
 * Get the station that reported the METAR
 * @param metar The metar to extract the reporting station from.
 * @returns The station found, otherwise "UNKNOWN".
 */
function getStation(metar) {
    if (metar.length < 3) {
        return unknown;
    }
    try {
        var tokens = metar.split(' ');
        if (tokens.length < 1) {
            return unknown;
        }
        var station = tokens[0].trim();
        if (station.length < 2 || station.length > 8) {
            return unknown;
        }
        return station;
    }
    catch (_a) {
        return unknown;
    }
}
exports.getStation = getStation;
/**
 * Given a METAR, what are the flight rules for the weather?
 * @param metar The METAR to extract the flight rules from.
 * @returns The flight rules for the station based on the METAR.
 */
function getFlightRules(metar) {
    var vis = getVisibilityCategory(metar);
    var ceiling = getCeilingCategory(metar);
    var flightRules = flight_rules_1.FlightRules.unknown;
    if (ceiling == flight_rules_1.FlightRules.unknown || vis == flight_rules_1.FlightRules.unknown) {
        flightRules = flight_rules_1.FlightRules.unknown;
    }
    else if (vis == flight_rules_1.FlightRules.lifr || ceiling == flight_rules_1.FlightRules.lifr) {
        flightRules = flight_rules_1.FlightRules.lifr;
    }
    else if (vis == flight_rules_1.FlightRules.ifr || ceiling == flight_rules_1.FlightRules.ifr) {
        flightRules = flight_rules_1.FlightRules.ifr;
    }
    else if (vis == flight_rules_1.FlightRules.mvfr || ceiling == flight_rules_1.FlightRules.mvfr) {
        flightRules = flight_rules_1.FlightRules.mvfr;
    }
    else if (vis == flight_rules_1.FlightRules.vfr && ceiling == flight_rules_1.FlightRules.vfr) {
        flightRules = flight_rules_1.FlightRules.vfr;
    }
    return flightRules;
}
exports.getFlightRules = getFlightRules;
function getVisibility(metar) {
    /**
     * Extracts the visibility value from a RAW METAR.
     *
     * @param metar - The RAW weather report in METAR format.
     * @returns The visibility value as a string, or null if not found.
     */
    var visRegEx = /\b(\d+\s\d\/\d|\d+\/\d|\d+)SM\b/; // /(\d+\s\d+\/\d+SM|\d+SM)/
    var match = metar.match(visRegEx);
    return match ? match[0].trim() : null;
}
function getCeiling(metar) {
    // Exclude the remarks from being parsed as the current
    // condition as they normally are for events that
    // are in the past.
    var components = getMainMetarComponents(metar);
    var minimumCeiling = 10000;
    for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
        var component = components_1[_i];
        if (component.toLocaleUpperCase().includes('BKN')
            || component.toLocaleUpperCase().includes('OVC')) {
            try {
                var ceiling = parseInt(component.replace(/\D/g, ""), 10) * 100;
                if (ceiling < minimumCeiling) {
                    minimumCeiling = ceiling;
                }
            }
            catch (_a) { }
        }
    }
    return minimumCeiling;
}
function getMainMetarComponents(metar) {
    return metar.toUpperCase().split("RMK")[0].split(" ").slice(1);
}
//# sourceMappingURL=metar.js.map