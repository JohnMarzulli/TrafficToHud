"use strict";

import { FlightRules } from './flight-rules';
import { Metar } from './metar';
import { ReportType } from './report-type';
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
    ): { [key in ReportType]: TextReport[] } {
        const secondsSinceLastGc = (Date.now() - TextReports.lastGcTime) / 1000;

        if (secondsSinceLastGc > 60) {
            TextReports.removeOldReports();

            TextReports.lastGcTime = Date.now();
        }

        const reports: { [key in ReportType]: TextReport[] } = {
            [ReportType.Metar]: [],
            [ReportType.Taf]: [],
            [ReportType.Text]: [],
            [ReportType.Airmet]: []
        };

        for (const report of TextReports.reports) {
            reports[report.reportType].push(report);
        }

        return reports;
    }

    public static getKnownFlightRules(
        req: Request | null
    ): { [key in string]: FlightRules } {
        const secondsSinceLastGc = (Date.now() - TextReports.lastGcTime) / 1000;

        if (secondsSinceLastGc > 60) {
            TextReports.removeOldReports();

            TextReports.lastGcTime = Date.now();
        }

        const knownFlightRules: { [key in string]: FlightRules } = {};

        for (const report of TextReports.reports) {
            if (report.reportType === ReportType.Metar) {
                const flightRules: FlightRules = (new Metar(`${report.station} ${report.report}`)).flightRules;
                knownFlightRules[report.station] = flightRules;
            }
        }

        return knownFlightRules;
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