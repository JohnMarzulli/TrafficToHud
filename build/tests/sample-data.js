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
    var logFiles = [
        '../../documentation/Uplink_2026-08-22T02_41_13_208Z.playback'
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
    /*
    [2026-08-22T03:48:36.903Z] - INFO  - FRAME: product=413, name=Generic Textual Data Product APDU Payload Format Type 2, opt=0, aFlag=false, gFlag=false, pFlag=false, sFlag=false, hours=23, minutes=53, padding=0
    [2026-08-22T03:48:36.904Z] - INFO  - RAW  : 06 74 5f 50 34 55 01 4a 02 c8 3d 58 30 d7 2c f5 cd a8 31 cf 0c 38 2d 48 31 c1 33 60 18 55 f0 d7 08 02 2c ec 70 c2 00 8b 3b 2d 70 83 3c 6f cb 48 01 cb 9e 37 81 23 4b 80 13 f2 82 07 9c 15 33 10 c7 2c 20 53 0c f0 db 0c b4 d2 0c 70 cf 2e 20 cb 0c b9 d2 0d 73 c3 0c a0 93 d7 9d
    [2026-08-22T03:48:36.904Z] - INFO  - Decoded generic text report: METAR KHOU 052353Z 13008KT 10SM FEW050 BKN100 BKN250 31/24 A2987 RMK AO2
        SLP120 T03060244 10328 20294 53002 $=
    */
    for (var _b = 0, logFiles_1 = logFiles; _b < logFiles_1.length; _b++) {
        var logFile = logFiles_1[_b];
        var filePath = path.resolve(__dirname, logFile);
        var fileContent = fs.readFileSync(filePath);
        var allLines = fileContent.toString().split('\n');
        var rawMessageLines = allLines.map(function (line) { return line.trim(); }).filter(function (line) { return line.includes('INFO  - RAW  :'); });
        var rawMessages = rawMessageLines.map(function (line) { return line.split('INFO  - RAW  :')[1].trim(); });
        var rawMessageBytes = rawMessages.map(getBytesFromLogLine);
        rawMessageBytes.map(getUplinkFrameFromLogBytes);
    }
    var tafs = [
        new text_report_1.TextReport("TAF KPAE 212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050\nFM220100 13012KT 6SM -RA BR OVC020\nFM220600 16014G21KT 6SM -RA BR OVC022\nFM221200 15012G18KT P6SM VCSH OVC015\nFM222100 15017G28KT 6SM -RA BR OVC025"),
        new text_report_1.TextReport("TAF KBFI 190540Z 1906/2006 17004KT P6SM BKN045 OVC090\nFM191100 13003KT P6SM OVC060\nFM191800 14004KT P6SM -RA OVC050\nFM192200 13010G20KT P6SM -RA OVC040\nFM200300 15012G25KT P6SM -RA OVC030"),
        new text_report_1.TextReport("TAF KSEA 190540Z 1906/2012 14006KT P6SM BKN040 OVC080\nFM191800 13006KT P6SM -RA OVC050\nFM192200 14010G20KT P6SM -RA OVC035\nFM200300 13013G25KT P6SM -RA OVC025\nFM201000 17012KT P6SM VCSH OVC035")
    ];
    for (var _c = 0, tafs_1 = tafs; _c < tafs_1.length; _c++) {
        var taf = tafs_1[_c];
        text_reports_1.TextReports.addReport(taf);
    }
}
exports.loadExamples = loadExamples;
function getBytesFromLogLine(line) {
    var parts = line.trim().split(/\s+/);
    var bytes = parts.map(function (p) { return parseInt(p, 16); });
    return new Uint8Array(bytes);
}
/**
 * Rebuilds the FIS-B APDU frame a "RAW  :" log line records back into a
 * decoded UatUplinkFrame.
 *
 * NOTE: the "RAW  :" lines logged by uplink.ts (see logFrame/UatUplinkFrame)
 * are NOT full top-level GDL90 messages. They're the individual product
 * frames already sliced out of a Gdl90Message's payload *after* that
 * message's own CRC-16 was validated (see Uplink's constructor and
 * getUplinkFrames in uplink.ts). That means this data has no leading 0x7E
 * flag byte, no message-type byte, and no trailing CRC-16 of its own - so
 * it can never be round-tripped through `new Gdl90Message()`/isCrcValid.
 * It has to be fed to UatUplinkFrame directly, the same way the real
 * pipeline produces it.
 */
function getUplinkFrameFromLogBytes(bytes) {
    return new uplink_1.UatUplinkFrame(0, 0, bytes);
}
//# sourceMappingURL=sample-data.js.map