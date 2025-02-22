"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var gdl90_message_1 = require("../gdl-messages/gdl90-message");
var flight_rules_1 = require("../weather/flight-rules");
var text_reports_1 = require("../weather/text-reports");
function loadExamples() {
    var exampleFiles = [
        '../../documentation/full-nexrad.json',
        '../../documentation/full-asa379.json',
        '../../documentation/full-lots-nexrad.json',
        '../../documentation/full-medley.json',
        '../../documentation/full-more-nexrad.json',
        '../../documentation/full-notams.json'
    ];
    for (var _i = 0, exampleFiles_1 = exampleFiles; _i < exampleFiles_1.length; _i++) {
        var exampleFile = exampleFiles_1[_i];
        var filePath = path.resolve(__dirname, exampleFile);
        try {
            var fileContent = fs.readFileSync(filePath, 'utf-8');
            var rawMessages = JSON.parse(fileContent);
            var uat7Reports = rawMessages["last_msg"]["7"];
            for (var _a = 0, uat7Reports_1 = uat7Reports; _a < uat7Reports_1.length; _a++) {
                var reportPackage = uat7Reports_1[_a];
                var reportText = reportPackage["report"];
                var byteStrings = ("126," + reportText + ",126").split(',');
                var packageAscci = byteStrings.map(function (byteString) { return parseInt(byteString); });
                var rawMessage = String.fromCharCode.apply(String, packageAscci);
                var gdl90Message = new gdl90_message_1.Gdl90Message(rawMessage);
                console.log(gdl90Message.decodedMessage);
            }
        }
        catch (err) {
            console.error('Error loading or parsing JSON file:', err);
        }
    }
}
function testGetFlightRules() {
    loadExamples();
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