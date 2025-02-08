export declare class TextReports {
    private static MaxReportAgeSeconds;
    private static reports;
    private static lastGcTime;
    static getReports(req: Request): any;
    static addReport(report: TextReport): void;
    private static removeOldReports;
}
declare enum ReportType {
    Text = "TEXT",
    Airmet = "AIRMET",
    Metar = "METAR",
    Taf = "TAF"
}
export declare class TextReport {
    readonly reportTime: number;
    readonly reportType: ReportType;
    readonly station: string;
    readonly report: string;
    getReportAgeSeconds(): number;
    constructor(rawReport: string);
    private getReportType;
}
export {};
