export class TextReports {
    private static MaxReportAgeSeconds = 60 * 60;
    private static reports: TextReport[] = [];
    private static lastGcTime: number = 0;

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

enum ReportType {
    Text = "TEXT",
    Airmet = "AIRMET",
    Metar = "METAR",
    Taf = "TAF"
};

export class TextReport {
    public readonly reportTime: number;
    public readonly reportType: ReportType;
    public readonly station: string;
    public readonly report: string;

    public getReportAgeSeconds(): number {
        return (Date.now() - this.reportTime) / 1000;
    }

    public constructor(
        rawReport: string
    ) {
        // TODO: Use the hour and minute from the message and combine it with the UTC date
        this.reportTime = Date.now();
        this.reportType = this.getReportType(rawReport);

        this.station = "UNK";
        this.report = rawReport;

        const regex = new RegExp("(K[A-Z0-9]{3})([\s\S])*",);
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