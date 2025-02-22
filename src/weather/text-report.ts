"use strict";

import * as metar from './metar';
import { ReportType } from './text-reports';
import * as assert from 'assert';

/**
 * Holds a text report.
 */
export class TextReport {
    /**
     * The time the report was received.
     *
     * @type {number}
     * @memberof TextReport
     */
    public readonly reportTime: number;

    /**
     * The type of report (Text, METAR, TAF, etc)
     *
     * @type {ReportType}
     * @memberof TextReport
     */
    public readonly reportType: ReportType;

    /**
     * The station the the report is from OR is about.
     *
     * @type {string}
     * @memberof TextReport
     */
    public readonly station: string;

    /**
     * The contents of the report.
     *
     * @type {string}
     * @memberof TextReport
     */
    public readonly report: string;

    /**
     * How many seconds since we received this report?
     * @returns The number of seconds since the report was received.
     */
    public getReportAgeSeconds(): number {
        return (Date.now() - this.reportTime) / 1000;
    }

    /**
     * Process and identify the text report.
     * @param rawReport The raw text of the report.
     */
    public constructor(
        rawReport: string
    ) {
        // TODO: Use the hour and minute from the message and combine it with the UTC date
        this.reportTime = Date.now();
        this.reportType = this.getReportType(rawReport);

        this.station = "UNK";
        this.report = rawReport;

        const regex = new RegExp("(K[A-Z0-9]{3})([\s\S])*");
        const match = rawReport.match(regex);

        if (match) {
            this.station = match[1].trim();
            // This is to work around EOL characters in large text blocks.
            let textReport: string = rawReport.substring(rawReport.indexOf(this.station) + this.station.length).trim();

            if (this.reportType != ReportType.Airmet) {
                textReport = textReport.replace(/\n/g, '');
            }

            textReport = textReport.replace(/ +/g, ' ');

            const separatorIndex = textReport.indexOf('\u001E');

            if (separatorIndex !== -1) {
                textReport = textReport.slice(0, separatorIndex);
            }

            this.report = textReport;

            if (this.reportType === ReportType.Metar) {
                metar.addReport(new metar.Metar(textReport));
            }
        }
    }

    private getReportType(
        rawReport: string
    ): ReportType {
        if (rawReport == null || rawReport == undefined) {
            return ReportType.Text;
        }

        const normalizedReport: string = rawReport.toLowerCase();

        if (normalizedReport.includes("airmet ")) {
            return ReportType.Airmet;
        }

        if (normalizedReport.includes("metar ")) {
            return ReportType.Metar;
        }

        if (normalizedReport.includes("taf ")) {
            return ReportType.Taf;
        }

        return ReportType.Text;
    }
}


function testMetarsAreDecoded(): void {
    const kpluMetar: TextReport = new TextReport("METAR KPLU 010555Z AUTO 00000KT 10SM 04/04 A3002 RMK AO2=\n\u001e\u0003");
    const k4s2Metar: TextReport = new TextReport("METAR K4S2 010555Z AUTO 00000KT 5SM RA SCT006 OVC017 01/01 A3011 RMK  \n      AO2=\n\u001e\u0003");
    const kpaeMetar: TextReport = new TextReport("METAR KPAE 220253Z 14007G15KT 9SM -RA SCT038 BKN045 OVC050 09/07 A3005 RMK AO2 RAE05B25 SLP179 P0000 60000 T00940072 55013");

    assert.strictEqual("010555Z AUTO 00000KT 10SM 04/04 A3002 RMK AO2=", kpluMetar.report);
    assert.strictEqual(true, kpluMetar.getReportAgeSeconds() < 1);
    assert.strictEqual("KPLU", kpluMetar.station);
    assert.strictEqual(ReportType.Metar, kpluMetar.reportType);

    assert.strictEqual("010555Z AUTO 00000KT 5SM RA SCT006 OVC017 01/01 A3011 RMK AO2=", k4s2Metar.report);
    assert.strictEqual(true, k4s2Metar.getReportAgeSeconds() < 1);
    assert.strictEqual("K4S2", k4s2Metar.station);
    assert.strictEqual(ReportType.Metar, k4s2Metar.reportType);

    assert.strictEqual("220253Z 14007G15KT 9SM -RA SCT038 BKN045 OVC050 09/07 A3005 RMK AO2 RAE05B25 SLP179 P0000 60000 T00940072 55013", kpaeMetar.report);
    assert.strictEqual(true, kpaeMetar.getReportAgeSeconds() < 1);
    assert.strictEqual("KPAE", kpaeMetar.station);
    assert.strictEqual(ReportType.Metar, kpaeMetar.reportType);

    console.log("PASSED: METAR decoding tests.");
}

function testTafsAreDecoded(): void {
    const kpaeTaf: TextReport = new TextReport(`TAF KPAE 212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050 
  FM220100 13012KT 6SM -RA BR OVC020 
  FM220600 16014G21KT 6SM -RA BR OVC022 
  FM221200 15012G18KT P6SM VCSH OVC015 
  FM222100 15017G28KT 6SM -RA BR OVC025`);

    assert.strictEqual("212320Z 2200/2224 11009G16KT P6SM -RA SCT020 BKN050 FM220100 13012KT 6SM -RA BR OVC020 FM220600 16014G21KT 6SM -RA BR OVC022 FM221200 15012G18KT P6SM VCSH OVC015 FM222100 15017G28KT 6SM -RA BR OVC025", kpaeTaf.report);
    assert.strictEqual(true, kpaeTaf.getReportAgeSeconds() < 1);
    assert.strictEqual("KPAE", kpaeTaf.station);
    assert.strictEqual(ReportType.Taf, kpaeTaf.reportType);

    console.log("PASSED: TAF decoding tests.");
}

testMetarsAreDecoded();
testTafsAreDecoded();