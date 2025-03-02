"use strict";

import * as assert from 'assert';
import { FlightRules } from '../weather/flight-rules';
import { TextReports } from '../weather/text-reports';
import { loadExamples } from "./sample_data";

function testGetFlightRules(): void {
    loadExamples();

    const knownFlightRules: { [key in string]: FlightRules } = TextReports.getKnownFlightRules(null);

    assert.strictEqual(true, knownFlightRules !== null);

    assert.strictEqual(FlightRules.vfr, knownFlightRules["K0S9"]);
    assert.strictEqual(FlightRules.mvfr, knownFlightRules["K4S2"]);
    assert.strictEqual(FlightRules.mvfr, knownFlightRules["K63S"]);
    assert.strictEqual(FlightRules.ifr, knownFlightRules["K6S2"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KBVS"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KPLU"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KS33"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KS39"]);
    assert.strictEqual(FlightRules.vfr, knownFlightRules["KSZT"]);

    console.log("PASSED: Flight rules categorization tests");
}

testGetFlightRules();