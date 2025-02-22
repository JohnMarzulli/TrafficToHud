"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportType = exports.TextReports = void 0;
/**
 * Provide way to collect and make available text reports
 * provided by uplink/UAT data
 */
var TextReports = /** @class */ (function () {
    function TextReports() {
    }
    /**
     * Get all of the available reports
     * @param req The REST request
     * @returns A set of all of the available reports.
     */
    TextReports.getReports = function (req) {
        var secondsSinceLastGc = (Date.now() - TextReports.lastGcTime) / 1000;
        if (secondsSinceLastGc > 60) {
            TextReports.removeOldReports();
            TextReports.lastGcTime = Date.now();
        }
        return TextReports.reports;
    };
    /**
     * Add a text report.
     * @param report The report to add.
     */
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
/**
 * The types of text reports that we can handle.
 */
var ReportType;
(function (ReportType) {
    /**
     * A pure text report.
     */
    ReportType["Text"] = "TEXT";
    /**
     * An airmet
     */
    ReportType["Airmet"] = "AIRMET";
    /**
     * A METAR for a station
     */
    ReportType["Metar"] = "METAR";
    /**
     * A TAF for a station.
     */
    ReportType["Taf"] = "TAF";
})(ReportType = exports.ReportType || (exports.ReportType = {}));
;
//# sourceMappingURL=text-reports.js.map