"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReport = void 0;
var metar = require("./metar");
var text_reports_1 = require("./text-reports");
var TextReport = /** @class */ (function () {
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
            var textReport = rawReport.substring(rawReport.indexOf(this.station) + this.station.length).trim();
            if (this.reportType != text_reports_1.ReportType.Airmet) {
                textReport = textReport.replace(/\n/g, '');
            }
            textReport = textReport.replace(/ +/g, ' ');
            var separatorIndex = textReport.indexOf('\u001E');
            if (separatorIndex !== -1) {
                textReport = textReport.slice(0, separatorIndex);
            }
            this.report = textReport;
            if (this.reportType === text_reports_1.ReportType.Metar) {
                metar.addReport(new metar.Metar(textReport));
            }
        }
    }
    TextReport.prototype.getReportAgeSeconds = function () {
        return (Date.now() - this.reportTime) / 1000;
    };
    TextReport.prototype.getReportType = function (rawReport) {
        if (rawReport == null || rawReport == text_reports_1.undefined) {
            return text_reports_1.ReportType.Text;
        }
        var normalizedReport = rawReport.toLowerCase();
        if (normalizedReport.includes("airmet ")) {
            return text_reports_1.ReportType.Airmet;
        }
        if (normalizedReport.includes("metar ")) {
            return text_reports_1.ReportType.Metar;
        }
        if (normalizedReport.includes("taf ")) {
            return text_reports_1.ReportType.Taf;
        }
        return text_reports_1.ReportType.Text;
    };
    return TextReport;
}());
exports.TextReport = TextReport;
//# sourceMappingURL=TextReport.js.map