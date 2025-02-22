"use strict";

import * as assert from 'assert';
import { FlightRules } from '../weather/flight-rules';
import { getCeilingCategory, getFlightRules, getStation, getVisibilityCategory } from '../weather/metar';


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

runVisbilityTests();
runCeilingTests();
runStationTests();
runCategoryTests();