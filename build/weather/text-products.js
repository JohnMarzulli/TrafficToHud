"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReport = exports.TextReports = void 0;
var metar = require("./metar");
var TextReports = /** @class */ (function () {
    function TextReports() {
    }
    TextReports.getReports = function (req) {
        var secondsSinceLastGc = (Date.now() - TextReports.lastGcTime) / 1000;
        if (secondsSinceLastGc > 60) {
            TextReports.removeOldReports();
            TextReports.lastGcTime = Date.now();
        }
        return TextReports.reports;
    };
    TextReports.addReport = function (report) {
        var criterion = function (obj) { return obj.reportType === report.reportType && obj.station === report.station; };
        var index = TextReports.reports.findIndex(criterion);
        if (index >= 0) {
            TextReports.reports[index] = report;
        }
        else {
            TextReports.reports.push(report);
        }
    };
    TextReports.removeOldReports = function () {
        var now = Date.now();
        var condition = function (report) { return (((now - report.reportTime) / 1000) > TextReports.MaxReportAgeSeconds); };
        TextReports.reports = TextReports.reports.filter(function (obj) { return !condition(obj); });
    };
    TextReports.MaxReportAgeSeconds = 60 * 60;
    TextReports.reports = [];
    TextReports.lastGcTime = 0;
    return TextReports;
}());
exports.TextReports = TextReports;
var ReportType;
(function (ReportType) {
    ReportType["Text"] = "TEXT";
    ReportType["Airmet"] = "AIRMET";
    ReportType["Metar"] = "METAR";
    ReportType["Taf"] = "TAF";
})(ReportType || (ReportType = {}));
;
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
            if (this.reportType != ReportType.Airmet) {
                textReport = textReport.replace(/\n/g, '');
            }
            textReport = textReport.replace(/ +/g, ' ');
            var separatorIndex = textReport.indexOf('\u001E');
            if (separatorIndex !== -1) {
                textReport = textReport.slice(0, separatorIndex);
            }
            this.report = textReport;
            if (this.reportType === ReportType.Metar) {
                metar.addReport(new metar.Metar(textReport));
            }
        }
    }
    TextReport.prototype.getReportAgeSeconds = function () {
        return (Date.now() - this.reportTime) / 1000;
    };
    TextReport.prototype.getReportType = function (rawReport) {
        if (rawReport == null || rawReport == undefined) {
            return ReportType.Text;
        }
        var normalizedReport = rawReport.toLowerCase();
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
    };
    return TextReport;
}());
exports.TextReport = TextReport;
//# sourceMappingURL=text-products.js.map