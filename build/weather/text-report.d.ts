import { ReportType } from './report-type';
/**
 * Holds a text report.
 */
export declare class TextReport {
    /**
     * The time the report was received.
     *
     * @type {number}
     * @memberof TextReport
     */
    readonly reportTime: number;
    /**
     * The type of report (Text, METAR, TAF, etc)
     *
     * @type {ReportType}
     * @memberof TextReport
     */
    readonly reportType: ReportType;
    /**
     * The station the the report is from OR is about.
     *
     * @type {string}
     * @memberof TextReport
     */
    readonly station: string;
    /**
     * The contents of the report.
     *
     * @type {string}
     * @memberof TextReport
     */
    readonly report: string;
    /**
     * How many seconds since we received this report?
     * @returns The number of seconds since the report was received.
     */
    getReportAgeSeconds(): number;
    /**
     * Process and identify the text report.
     * @param rawReport The raw text of the report.
     */
    constructor(rawReport: string);
    private getReportType;
}
