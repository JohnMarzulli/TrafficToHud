"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReport = void 0;
var metar = require("./metar");
var text_reports_1 = require("./text-reports");
var assert = require("assert");
/**
 * Holds a text report.
 */
var TextReport = /** @class */ (function () {
    /**
     * Process and identify the text report.
     * @param rawReport The raw text of the report.
     */
    function TextReport(rawReport) {
        // TODO: Use the hour and minute from the message and combine it with the UTC date
        this.reportTime = Date.now();
        this.reportType = this.getReportType(rawReport);
        this.station = "UNK";
        this.report = rawReport;
        var regex = new RegExp("(K[A-Z0-9]{3})([\s\S])*");
        var match = rawReport.match(regex);
        if (match) {
            this.station = match[1].trim();
            // This is to work around EOL characters in large text blocks.
            var textReport = rawReport.substring(rawReport.indexOf(this.station) + this.station.length).trim();
            if (this.reportType != text_reports_1.ReportType.Airmet) {
                textReport = textReport.replace(/\n/g, '');
            }
            textReport = textReport.replace(/ +/g, ' ');
            var separatorIndex = textReport.indexOf('\u001E');
            if (separatorIndex !== -1) {
                textReport = textReport.slice(0, separatorIndex);
            }
            this.report = textReport;
            if (this.reportType === text_reports_1.ReportType.Metar) {
                metar.addReport(new metar.Metar(textReport));
            }
        }
    }
    /**
     * How many seconds since we received this report?
     * @returns The number of seconds since the report was received.
     */
    TextReport.prototype.getReportAgeSeconds = function () {
        return (Date.now() - this.reportTime) / 1000;
    };
    TextReport.prototype.getReportType = function (rawReport) {
        if (rawReport == null || rawReport == undefined) {
            return text_reports_1.ReportType.Text;
        }
        var normalizedReport = rawReport.toLowerCase();
        if (normalizedReport.includes("airmet ")) {
            return text_reports_1.ReportType.Airmet;
        }
        if (normalizedReport.includes("metar ")) {
            return text_reports_1.ReportType.Metar;
        }
        if (normalizedReport.includes("taf ")) {
            return text_reports_1.ReportType.Taf;
        }
        return text_reports_1.ReportType.Text;
    };
    return TextReport;
}());
exports.TextReport = TextReport;
function testMetarsAreDecoded() {
    var kpluMetar = new TextReport("METAR KPLU 010555Z AUTO 00000KT 10SM 04/04 A3002 RMK AO2=\n\u001e\u0003");
    var k4s2Metar = new TextReport("METAR K4S2 010555Z AUTO 00000KT 5SM RA SCT006 OVC017 01/01 A3011 RMK  \n      AO2=\n\u001e\u0003");
    var kpaeMetar = new TextReport("METAR KPAE 220253Z 14007G15KT 9SM -RA SCT038 BKN045 OVC050 09/07 A3005 RMK AO2 RAE05B25 SLP179 P0000 60000 T00940072 55013");
    assert.strictEqual("010555Z AUTO 00000KT 10SM 04/04 A3002 RMK AO2=", kpluMetar.report);
    assert.strictEqual(true, kpluMetar.getReportAgeSeconds() < 1);
    assert.strictEqual("KPLU", kpluMetar.station);
    assert.strictEqual(text_reports_1.ReportType.Metar, kpluMetar.reportType);
    assert.strictEqual("010555Z AUTO 00000KT 5SM RA SCT006 OVC017 01/01 A3011 RMK AO2=", k4s2Metar.report);
    assert.strictEqual(true, k4s2Metar.getReportAgeSeconds() < 1);
    assert.strictEqual("K4S2", k4s2Metar.station);
    assert.strictEqual(text_reports_1.ReportType.Metar, k4s2Metar.reportType);
    assert.strictEqual("220253Z 14007G15KT 9SM -RA SCT038 BKN045 OVC050 09/07 A3005 RMK AO2 RAE05B25 SLP179 P0000 60000 T00940072 55013", kpaeMetar.report);
    assert.strictEqual(true, kpaeMetar.getReportAgeSeconds() < 1);
    assert.strictEqual("KPAE", kpaeMetar.station);
    assert.strictEqual(text_reports_1.ReportType.Metar, kpaeMetar.reportType);
    console.log("PASSED: METAR decoding tests.");
}
function testTafsAreDecoded() {
    var kpaeTaf = new TextReport("TAF KPAE 212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050 \n  FM220100 13012KT 6SM -RA BR OVC020 \n  FM220600 16014G21KT 6SM -RA BR OVC022 \n  FM221200 15012G18KT P6SM VCSH OVC015 \n  FM222100 15017G28KT 6SM -RA BR OVC025");
    assert.strictEqual("212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050 FM220100 13012KT 6SM -RA BR OVC020 FM220600 16014G21KT 6SM -RA BR OVC022 FM221200 15012G18KT P6SM VCSH OVC015 FM222100 15017G28KT 6SM -RA BR OVC025", kpaeTaf.report);
    assert.strictEqual(true, kpaeTaf.getReportAgeSeconds() < 1);
    assert.strictEqual("KPAE", kpaeTaf.station);
    assert.strictEqual(text_reports_1.ReportType.Taf, kpaeTaf.reportType);
    console.log("PASSED: TAF decoding tests.");
}
testMetarsAreDecoded();
testTafsAreDecoded();
//# sourceMappingURL=text-report.js.map