"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var flight_rules_1 = require("../weather/flight-rules");
var metar_1 = require("../weather/metar");
function runVisbilityTests() {
    assert.strictEqual(metar_1.getVisibilityCategory('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.vfr);
    assert.strictEqual(metar_1.getVisibilityCategory('KRNT 132053Z 33010KT 4SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.mvfr);
    assert.strictEqual(metar_1.getVisibilityCategory('KRNT 132053Z 33010KT 3SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.mvfr);
    assert.strictEqual(metar_1.getVisibilityCategory('KRNT 132053Z 33010KT 2 1/2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.ifr);
    assert.strictEqual(metar_1.getVisibilityCategory('KRNT 132053Z 33010KT 2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.ifr);
    assert.strictEqual(metar_1.getVisibilityCategory('KRNT 132053Z 33010KT 1SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.ifr);
    assert.strictEqual(metar_1.getVisibilityCategory('KRNT 132053Z 33010KT 1/2SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.lifr);
    assert.strictEqual(metar_1.getVisibilityCategory('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), flight_rules_1.FlightRules.vfr);
    assert.strictEqual(metar_1.getVisibilityCategory('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), flight_rules_1.FlightRules.vfr);
    console.log("PASSED: Visbility categorization tests");
}
function runCeilingTests() {
    assert.strictEqual(metar_1.getCeilingCategory('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.vfr);
    assert.strictEqual(metar_1.getCeilingCategory('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.vfr);
    assert.strictEqual(metar_1.getCeilingCategory('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.mvfr);
    assert.strictEqual(metar_1.getCeilingCategory('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.ifr);
    assert.strictEqual(metar_1.getCeilingCategory('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.ifr);
    assert.strictEqual(metar_1.getCeilingCategory('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.lifr);
    assert.strictEqual(metar_1.getCeilingCategory('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.lifr);
    assert.strictEqual(metar_1.getCeilingCategory('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), flight_rules_1.FlightRules.vfr);
    assert.strictEqual(metar_1.getCeilingCategory('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), flight_rules_1.FlightRules.mvfr);
    console.log("PASSED: Ceiling categorization tests");
}
function runStationTests() {
    assert.strictEqual(metar_1.getStation('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(metar_1.getStation('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(metar_1.getStation('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(metar_1.getStation('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(metar_1.getStation('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(metar_1.getStation('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(metar_1.getStation('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), 'KRNT');
    assert.strictEqual(metar_1.getStation('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), 'KGCC');
    assert.strictEqual(metar_1.getStation('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), 'KVOK');
    console.log("PASSED: Station extraction tests");
}
function runCategoryTests() {
    assert.strictEqual(metar_1.getFlightRules('KRNT 132053Z 33010KT 10SM SCT034 SCT041 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.vfr);
    assert.strictEqual(metar_1.getFlightRules('KRNT 132053Z 33010KT 4SM SCT041 OVC030 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.mvfr);
    assert.strictEqual(metar_1.getFlightRules('KRNT 132053Z 33010KT 3SM SCT041 BKN025 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.mvfr);
    assert.strictEqual(metar_1.getFlightRules('KRNT 132053Z 33010KT 2 1/2SM SCT041 BKN009 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.ifr);
    assert.strictEqual(metar_1.getFlightRules('KRNT 132053Z 33010KT 2 1/2SM SCT041 OVC009 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.ifr);
    assert.strictEqual(metar_1.getFlightRules('KRNT 132053Z 33010KT 2SM OVC004 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.lifr);
    assert.strictEqual(metar_1.getFlightRules('KRNT 132053Z 33010KT 2SM SCT010 OVC004 23/14 A3001 RMK AO2 SLP165'), flight_rules_1.FlightRules.lifr);
    assert.strictEqual(metar_1.getFlightRules('KGCC 231853Z AUTO 28011KT 20/12 A2991 RMK AO2 LTG DSNT SE RAB41RAEMM SLP085 P0000 T02000117 PWINO $'), flight_rules_1.FlightRules.vfr);
    assert.strictEqual(metar_1.getFlightRules('KVOK 251453Z 34004KT 10SM SCT008 OVC019 21/21 A2988 RMK AO2A SCT V BKN SLP119 53012'), flight_rules_1.FlightRules.mvfr);
    console.log("PASSED: Flight rules categorization tests");
}
runVisbilityTests();
runCeilingTests();
runStationTests();
runCategoryTests();
//# sourceMappingURL=metar.test.js.map