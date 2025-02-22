"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var report_type_1 = require("../weather/report-type");
var text_report_1 = require("../weather/text-report");
function testMetarsAreDecoded() {
    var kpluMetar = new text_report_1.TextReport("METAR KPLU 010555Z AUTO 00000KT 10SM 04/04 A3002 RMK AO2=\n\u001e\u0003");
    var k4s2Metar = new text_report_1.TextReport("METAR K4S2 010555Z AUTO 00000KT 5SM RA SCT006 OVC017 01/01 A3011 RMK  \n      AO2=\n\u001e\u0003");
    var kpaeMetar = new text_report_1.TextReport("METAR KPAE 220253Z 14007G15KT 9SM -RA SCT038 BKN045 OVC050 09/07 A3005 RMK AO2 RAE05B25 SLP179 P0000 60000 T00940072 55013");
    assert.strictEqual("010555Z AUTO 00000KT 10SM 04/04 A3002 RMK AO2=", kpluMetar.report);
    assert.strictEqual(true, kpluMetar.getReportAgeSeconds() < 1);
    assert.strictEqual("KPLU", kpluMetar.station);
    assert.strictEqual(report_type_1.ReportType.Metar, kpluMetar.reportType);
    assert.strictEqual("010555Z AUTO 00000KT 5SM RA SCT006 OVC017 01/01 A3011 RMK AO2=", k4s2Metar.report);
    assert.strictEqual(true, k4s2Metar.getReportAgeSeconds() < 1);
    assert.strictEqual("K4S2", k4s2Metar.station);
    assert.strictEqual(report_type_1.ReportType.Metar, k4s2Metar.reportType);
    assert.strictEqual("220253Z 14007G15KT 9SM -RA SCT038 BKN045 OVC050 09/07 A3005 RMK AO2 RAE05B25 SLP179 P0000 60000 T00940072 55013", kpaeMetar.report);
    assert.strictEqual(true, kpaeMetar.getReportAgeSeconds() < 1);
    assert.strictEqual("KPAE", kpaeMetar.station);
    assert.strictEqual(report_type_1.ReportType.Metar, kpaeMetar.reportType);
    console.log("PASSED: METAR decoding tests.");
}
function testTafsAreDecoded() {
    var kpaeTaf = new text_report_1.TextReport("TAF KPAE 212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050 \n  FM220100 13012KT 6SM -RA BR OVC020 \n  FM220600 16014G21KT 6SM -RA BR OVC022 \n  FM221200 15012G18KT P6SM VCSH OVC015 \n  FM222100 15017G28KT 6SM -RA BR OVC025");
    assert.strictEqual("212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050 FM220100 13012KT 6SM -RA BR OVC020 FM220600 16014G21KT 6SM -RA BR OVC022 FM221200 15012G18KT P6SM VCSH OVC015 FM222100 15017G28KT 6SM -RA BR OVC025", kpaeTaf.report);
    assert.strictEqual(true, kpaeTaf.getReportAgeSeconds() < 1);
    assert.strictEqual("KPAE", kpaeTaf.station);
    assert.strictEqual(report_type_1.ReportType.Taf, kpaeTaf.reportType);
    console.log("PASSED: TAF decoding tests.");
}
testMetarsAreDecoded();
testTafsAreDecoded();
//# sourceMappingURL=text-report.test.js.map