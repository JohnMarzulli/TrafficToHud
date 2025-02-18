"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReport = exports.addReport = exports.Metar = exports.FlightRules = void 0;
var assert = require("assert");
var unknown = "Unknown";
/**
 * List of flight rule categories
 */
var FlightRules;
(function (FlightRules) {
    /**
     * Unable to decode the flight rules
     */
    FlightRules["unknown"] = "UNK";
    /**
     * Visual Flight Rules
     */
    FlightRules["vfr"] = "VFR";
    /**
     * Marginal Visual Flight Rules
     */
    FlightRules["mvfr"] = "mvfr";
    /**
     * Instrument Flight Rules
     */
    FlightRules["ifr"] = "ifr";
    /**
     * Low Instrument Flight Rules
     */
    FlightRules["lifr"] = "lifr";
})(FlightRules = exports.FlightRules || (exports.FlightRules = {}));
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
 * Add a report to the current known metars.
 * @param report The report to add.
 */
function addReport(report) {
    metars[report.station] = report;
    // TODO: Prune these reports based on age.
}
exports.addReport = addReport;
/**
 * Get any reports for the given station/
 * @param station The station to get the metar for.
 * @returns The report, if any were found. Otherwise returns `null`.
 */
function getReport(station) {
    try {
        return metars[station.trim().toUpperCase()];
    }
    catch (_a) {
        return null;
    }
}
exports.getReport = getReport;
var metars = {};
function getFlightRules(metar) {
    var vis = getVisibilityCategory(metar);
    var ceiling = getCeilingCategory(metar);
    var flightRules = FlightRules.unknown;
    if (ceiling == FlightRules.unknown || vis == FlightRules.unknown) {
        flightRules = FlightRules.unknown;
    }
    else if (vis == FlightRules.lifr || ceiling == FlightRules.lifr) {
        flightRules = FlightRules.lifr;
    }
    else if (vis == FlightRules.ifr || ceiling == FlightRules.ifr) {
        flightRules = FlightRules.ifr;
    }
    else if (vis == FlightRules.mvfr || ceiling == FlightRules.mvfr) {
        flightRules = FlightRules.mvfr;
    }
    else if (vis == FlightRules.vfr && ceiling == FlightRules.vfr) {
        flightRules = FlightRules.vfr;
    }
    return flightRules;
}
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
function getVisibilityCategory(metar) {
    var _a, _b;
    var visbilityText = (_b = (_a = getVisibility(metar)) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === null || _b === void 0 ? void 0 : _b.replace("SM", "");
    if (visbilityText == null) {
        return FlightRules.vfr;
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
        return FlightRules.lifr;
    }
    if (distance < 3) {
        return FlightRules.ifr;
    }
    if (distance <= 5) {
        return FlightRules.mvfr;
    }
    return FlightRules.vfr;
}
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
function getCeilingCategory(metar) {
    var ceiling = getCeiling(metar);
    if (ceiling <= 500) {
        return FlightRules.lifr;
    }
    else if (ceiling <= 1000) {
        return FlightRules.ifr;
    }
    else if (ceiling < 3000) {
        return FlightRules.mvfr;
    }
    return FlightRules.vfr;
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
function runVisbilityTests() {
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 4SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 3SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 2 1/2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 1SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getVisibilityCategory('KRNT 132053Z 33010KT 1/2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getVisibilityCategory('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), FlightRules.vfr);
    assert.strictEqual(getVisibilityCategory('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), FlightRules.vfr);
    console.log("PASSED: Visbility categorization tests");
}
function runCeilingTests() {
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getCeilingCategory('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getCeilingCategory('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), FlightRules.vfr);
    assert.strictEqual(getCeilingCategory('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), FlightRules.mvfr);
    console.log("PASSED: Ceiling categorization tests");
}
function runStationTests() {
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(getStation('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), 'KGCC');
    assert.strictEqual(getStation('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), 'KVOK');
    console.log("PASSED: Station extraction tests");
}
function runCategoryTests() {
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), FlightRules.vfr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), FlightRules.mvfr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), FlightRules.ifr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getFlightRules('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), FlightRules.lifr);
    assert.strictEqual(getFlightRules('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), FlightRules.vfr);
    assert.strictEqual(getFlightRules('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), FlightRules.mvfr);
    console.log("PASSED: Flight rules categorization tests");
}
function runAddReportTests() {
    var initialReport = 'KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165';
    addReport(new Metar(initialReport));
    var idents = ['KRNT', 'Krnt', 'krnt'];
    for (var _i = 0, idents_1 = idents; _i < idents_1.length; _i++) {
        var ident = idents_1[_i];
        var foundReport = getReport(ident);
        assert.strictEqual(foundReport.metar, initialReport);
    }
    console.log("PASSED: Report adding & fetching tests");
}
runVisbilityTests();
runCeilingTests();
runStationTests();
runCategoryTests();
runAddReportTests();
//# sourceMappingURL=metar.js.map