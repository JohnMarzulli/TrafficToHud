"use strict";

import { TextReport } from './text-report';

/**
 * Provide way to collect and make available text reports
 * provided by uplink/UAT data
 */
export class TextReports {
    private static MaxReportAgeSeconds = 60 * 60;
    private static reports: TextReport[] = [];
    private static lastGcTime: number = 0;

    /**
     * Get all of the available reports
     * @param req The REST request
     * @returns A set of all of the available reports.
     */
    public static getReports(
        req: Request
    ): any {
        const secondsSinceLastGc = (Date.now() - TextReports.lastGcTime) / 1000;

        if (secondsSinceLastGc > 60) {
            TextReports.removeOldReports();

            TextReports.lastGcTime = Date.now();
        }

        return TextReports.reports;
    }

    /**
     * Add a text report.
     * @param report The report to add.
     */
    public static addReport(
        report: TextReport,
    ): void {
        const criterion = (obj: TextReport) => obj.reportType === report.reportType && obj.station === report.station;
        const index = TextReports.reports.findIndex(criterion);

        if (index >= 0) {
            TextReports.reports[index] = report;
        } else {
            TextReports.reports.push(report);
        }
    }

    private static removeOldReports(): void {
        const now = Date.now();
        const condition = (report: TextReport) => (((now - report.reportTime) / 1000) > TextReports.MaxReportAgeSeconds);
        TextReports.reports = TextReports.reports.filter(obj => !condition(obj));
    }
}

/**
 * The types of text reports that we can handle.
 */
export enum ReportType {
    /**
     * A pure text report.
     */
    Text = "TEXT",

    /**
     * An airmet
     */
    Airmet = "AIRMET",

    /**
     * A METAR for a station
     */
    Metar = "METAR",

    /**
     * A TAF for a station.
     */
    Taf = "TAF"
};