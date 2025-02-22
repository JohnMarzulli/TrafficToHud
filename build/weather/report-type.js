"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportType = void 0;
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
//# sourceMappingURL=report-type.js.map