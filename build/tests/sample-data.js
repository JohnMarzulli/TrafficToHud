"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadExamples = exports.faaExampleNexradOregonFirstHalf = void 0;
var fs = require("fs");
var path = require("path");
var gdl90_message_1 = require("../gdl-messages/gdl90-message"); // Assuming Gdl90Message is in this file
var uplink_1 = require("../gdl-messages/uplink"); // Assuming decodePayloadFromSample is in this file
var text_report_1 = require("../weather/text-report");
var text_reports_1 = require("../weather/text-reports");
// Corner: 45'8", 123'12" => 45.1333, -123.2
// Corner: 45'4", 122'24" => 45.0667, -122.4
exports.faaExampleNexradOregonFirstHalf = "130000FC000084A570308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A3AE00090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A1EC00090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AAB7308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108208000FC000084A8F500090A1314150617061D04130A01080112131C0D06270615140B0A01000112131C0D06270615140B0A010000090A1314150617061D04130A0108148000FC000084A73300090A1B0C1D0607061D041B0A010808110A23451B0A091018111A53120920308930130000FC000084AFFD308950111A53120930110A23451B0A0918090A1B0C1D0607061D041B0A0108000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
function loadExamples() {
    uplink_1.decodePayloadFromSample();
    var exampleFiles = [
        '../../documentation/weird-metar-decode.json',
        '../../documentation/more-weird-metar.json',
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
                var _ = new gdl90_message_1.Gdl90Message(rawMessage);
            }
        }
        catch (err) {
            console.error('Error loading or parsing JSON file:', err);
        }
    }
    var tafs = [
        new text_report_1.TextReport("TAF KPAE 212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050\nFM220100 13012KT 6SM -RA BR OVC020\nFM220600 16014G21KT 6SM -RA BR OVC022\nFM221200 15012G18KT P6SM VCSH OVC015\nFM222100 15017G28KT 6SM -RA BR OVC025"),
        new text_report_1.TextReport("TAF KBFI 190540Z 1906/2006 17004KT P6SM BKN045 OVC090\nFM191100 13003KT P6SM OVC060\nFM191800 14004KT P6SM -RA OVC050\nFM192200 13010G20KT P6SM -RA OVC040\nFM200300 15012G25KT P6SM -RA OVC030"),
        new text_report_1.TextReport("TAF KSEA 190540Z 1906/2012 14006KT P6SM BKN040 OVC080\nFM191800 13006KT P6SM -RA OVC050\nFM192200 14010G20KT P6SM -RA OVC035\nFM200300 13013G25KT P6SM -RA OVC025\nFM201000 17012KT P6SM VCSH OVC035")
    ];
    for (var _b = 0, tafs_1 = tafs; _b < tafs_1.length; _b++) {
        var taf = tafs_1[_b];
        text_reports_1.TextReports.addReport(taf);
    }
}
exports.loadExamples = loadExamples;
//# sourceMappingURL=sample-data.js.map