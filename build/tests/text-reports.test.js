"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var flight_rules_1 = require("../weather/flight-rules");
var text_reports_1 = require("../weather/text-reports");
var load_examples_1 = require("../load-examples");
function testGetFlightRules() {
    load_examples_1.loadExamples();
    var knownFlightRules = text_reports_1.TextReports.getKnownFlightRules(null);
    assert.strictEqual(true, knownFlightRules !== null);
    assert.strictEqual(flight_rules_1.FlightRules.vfr, knownFlightRules["K0S9"]);
    assert.strictEqual(flight_rules_1.FlightRules.mvfr, knownFlightRules["K4S2"]);
    assert.strictEqual(flight_rules_1.FlightRules.mvfr, knownFlightRules["K63S"]);
    assert.strictEqual(flight_rules_1.FlightRules.ifr, knownFlightRules["K6S2"]);
    assert.strictEqual(flight_rules_1.FlightRules.vfr, knownFlightRules["KBVS"]);
    assert.strictEqual(flight_rules_1.FlightRules.vfr, knownFlightRules["KPLU"]);
    assert.strictEqual(flight_rules_1.FlightRules.vfr, knownFlightRules["KS33"]);
    assert.strictEqual(flight_rules_1.FlightRules.vfr, knownFlightRules["KS39"]);
    assert.strictEqual(flight_rules_1.FlightRules.vfr, knownFlightRules["KSZT"]);
    console.log("PASSED: Flight rules categorization tests");
}
testGetFlightRules();
//# sourceMappingURL=text-reports.test.js.map