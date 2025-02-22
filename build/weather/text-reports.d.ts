import { TextReport } from './text-report';
/**
 * Provide way to collect and make available text reports
 * provided by uplink/UAT data
 */
export declare class TextReports {
    private static MaxReportAgeSeconds;
    private static reports;
    private static lastGcTime;
    /**
     * Get all of the available reports
     * @param req The REST request
     * @returns A set of all of the available reports.
     */
    static getReports(req: Request): any;
    /**
     * Add a text report.
     * @param report The report to add.
     */
    static addReport(report: TextReport): void;
    private static removeOldReports;
}
/**
 * The types of text reports that we can handle.
 */
export declare enum ReportType {
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
}
