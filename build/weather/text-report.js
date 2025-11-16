"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReport = void 0;
var report_type_1 = require("./report-type");
/**
 * Holds a text report.
 */
var TextReport = /** @class */ (function () {
    /**
     * Process and identify the text report.
     * @param rawReport The raw text of the report.
     */
    function TextReport(rawReport) {
        // TODO: Use the hour and minute from the message and combine it with the UTC date
        this.reportTime = Date.now();
        this.reportType = this.getReportType(rawReport);
        this.station = "UNK";
        this.report = rawReport;
        var regex = new RegExp("(K[A-Z0-9]{3})([\s\S])*");
        var match = rawReport.match(regex);
        if (match) {
            this.station = match[1].trim();
            // This is to work around EOL characters in large text blocks.
            var textReport = this.reportType === report_type_1.ReportType.Text
                ? rawReport
                : rawReport.substring(rawReport.indexOf(this.station) + this.station.length);
            textReport = textReport.trim();
            textReport = textReport.replace(/ +/g, ' ');
            var separatorIndex = textReport.indexOf('\u001E');
            if (separatorIndex !== -1) {
                textReport = textReport.slice(0, separatorIndex);
            }
            textReport = textReport.trimEnd();
            this.report = textReport;
        }
    }
    /**
     * How many seconds since we received this report?
     * @returns The number of seconds since the report was received.
     */
    TextReport.prototype.getReportAgeSeconds = function () {
        return (Date.now() - this.reportTime) / 1000;
    };
    TextReport.prototype.getReportType = function (rawReport) {
        var detectedType = report_type_1.ReportType.Text;
        var normalizedReport = rawReport.toLowerCase();
        if (rawReport == null || rawReport == undefined) {
            detectedType = report_type_1.ReportType.Text;
        }
        else if (normalizedReport.includes("airmet ")) {
            detectedType = report_type_1.ReportType.Airmet;
        }
        else if (normalizedReport.includes("metar ")) {
            detectedType = report_type_1.ReportType.Metar;
        }
        else if (normalizedReport.includes("taf ")) {
            detectedType = report_type_1.ReportType.Taf;
        }
        // Includes "no4am" which is a NOTAM
        return detectedType;
    };
    return TextReport;
}());
exports.TextReport = TextReport;
//# sourceMappingURL=text-report.js.map