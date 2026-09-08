import { FlightRules } from './flight-rules';
import { ReportType } from './report-type';
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
    static getReports(req: Request): {
        [key in ReportType]: TextReport[];
    };
    static getKnownFlightRules(req: Request | null): {
        [key in string]: FlightRules;
    };
    /**
     * Add a text report.
     * @param report The report to add.
     */
    static addReport(report: TextReport): void;
    private static removeOldReports;
}
