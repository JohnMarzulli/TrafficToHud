import { ReportType } from './text-reports';
export declare class TextReport {
    readonly reportTime: number;
    readonly reportType: ReportType;
    readonly station: string;
    readonly report: string;
    getReportAgeSeconds(): number;
    constructor(rawReport: string);
    private getReportType;
}
