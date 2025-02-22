"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReports = void 0;
var metar_1 = require("./metar");
var report_type_1 = require("./report-type");
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
        var _a;
        var secondsSinceLastGc = (Date.now() - TextReports.lastGcTime) / 1000;
        if (secondsSinceLastGc > 60) {
            TextReports.removeOldReports();
            TextReports.lastGcTime = Date.now();
        }
        var reports = (_a = {},
            _a[report_type_1.ReportType.Metar] = [],
            _a[report_type_1.ReportType.Taf] = [],
            _a[report_type_1.ReportType.Text] = [],
            _a[report_type_1.ReportType.Airmet] = [],
            _a);
        for (var _i = 0, _b = TextReports.reports; _i < _b.length; _i++) {
            var report = _b[_i];
            reports[report.reportType].push(report);
        }
        return reports;
    };
    TextReports.getKnownFlightRules = function (req) {
        var secondsSinceLastGc = (Date.now() - TextReports.lastGcTime) / 1000;
        if (secondsSinceLastGc > 60) {
            TextReports.removeOldReports();
            TextReports.lastGcTime = Date.now();
        }
        var knownFlightRules = {};
        for (var _i = 0, _a = TextReports.reports; _i < _a.length; _i++) {
            var report = _a[_i];
            if (report.reportType === report_type_1.ReportType.Metar) {
                var flightRules = (new metar_1.Metar(report.station + " " + report.report)).flightRules;
                knownFlightRules[report.station] = flightRules;
            }
        }
        return knownFlightRules;
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
//# sourceMappingURL=text-reports.js.map