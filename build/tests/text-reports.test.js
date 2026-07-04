"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var fs = require("fs");
var path = require("path");
var data_handling_1 = require("../data-handling");
var gdl90_message_1 = require("../gdl-messages/gdl90-message");
var flight_rules_1 = require("../weather/flight-rules");
var text_reports_1 = require("../weather/text-reports");
var badRawReports = [
    "06 74 08 00 5c fd fd 4e 03 42 5e 0c 35 fd 0c 30 6a 08 06 51 fd 39 fd 0c 1c 0f 1c fd fd 07 07 cc 30 fd fd fd fd 0c 30 70 3c fd fd 0c 1c 13 3d 30 fd 08 20 dc 30 fd fd 5e 71 0c fd d7 04 dc 39 fd 1c 20 fd 7c 72 fd 0e 60 fd 1c 71 fd 2c 60 fd 5c 79 c8 30 fd 2d 74 fd 0c fd fd 1d 74 79 fd 32 00 00 21 39",
    "06 74 07 30 34 55 01 4a 02 fd 48 48 30 fd 0c 75 68 03 3d 28 33 fd 0c 33 2d 48 31 fd 33 60 4c 35 30 fd 68 02 2c fd 70 fd 00 fd 3b 1d fd fd fd fd fd 5c 20 fd 7b fd fd 08 1e 70 50 72 60 48 fd fd 04 fd fd 4c fd 31 d8 03 3c fd fd 31 41 fd 0c 31 fd 11 33 fd fd 31 6d 4d 7b 4e 5e 00 80 44 fd 52 08 1e 70 54 75 35 fd 39 78 0d 3d 68 05 fd 4c 32 fd 2c 32 df 5e 74 41 00 06 74 07 50 34"
];
function loadExamples() {
    var _a;
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
            for (var _b = 0, uat7Reports_1 = uat7Reports; _b < uat7Reports_1.length; _b++) {
                var reportPackage = uat7Reports_1[_b];
                var reportText = reportPackage["report"];
                var deframedBytes = new Uint8Array(reportText.split(',').map(function (byteString) { return parseInt(byteString); }));
                var packageAscci = __spreadArrays([0x7E], Array.from(data_handling_1.escapeData(deframedBytes)), [0x7E]);
                var rawMessage = String.fromCharCode.apply(String, packageAscci);
                var gdl90Message = new gdl90_message_1.Gdl90Message(rawMessage);
                console.log((_a = gdl90Message.decodedMessage) !== null && _a !== void 0 ? _a : "<NULL>");
            }
        }
        catch (err) {
            console.error('Error loading or parsing JSON file:', err);
        }
    }
}
function testBadRawReportsAreRejected() {
    var _a;
    for (var _i = 0, badRawReports_1 = badRawReports; _i < badRawReports_1.length; _i++) {
        var rawReport = badRawReports_1[_i];
        var deframedBytes = new Uint8Array(rawReport.split(' ').map(function (byteString) { return parseInt(byteString); }));
        var packageAscci = __spreadArrays([0x7E], Array.from(data_handling_1.escapeData(deframedBytes)), [0x7E]);
        var rawMessage = String.fromCharCode.apply(String, packageAscci);
        var gdl90Message = new gdl90_message_1.Gdl90Message(rawMessage);
        console.log((_a = gdl90Message.decodedMessage) !== null && _a !== void 0 ? _a : "<NULL>");
        assert.strictEqual(gdl90Message.decodedMessage, null);
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
testBadRawReportsAreRejected();
//# sourceMappingURL=text-reports.test.js.map