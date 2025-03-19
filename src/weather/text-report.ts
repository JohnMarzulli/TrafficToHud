"use strict";

import { ReportType } from './report-type';

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

            textReport = textReport.replace(/ +/g, ' ');

            const separatorIndex = textReport.indexOf('\u001E');

            if (separatorIndex !== -1) {
                textReport = textReport.slice(0, separatorIndex);
            }

            this.report = textReport;
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