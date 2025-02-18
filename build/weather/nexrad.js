"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reflectivity = exports.ReflectivityRadar = void 0;
/**
 * Stores reflectivity maps and provides a way to retrieve them.
 */
var ReflectivityRadar = /** @class */ (function () {
    function ReflectivityRadar() {
    }
    /**
     * Retrieve ALL of the reflectivity maps.
     * @param req The REST request bundle.
     * @returns A set of all known reflectivity blocks.
     */
    ReflectivityRadar.getReflectivity = function (req) {
        var secondsSinceLastGc = (Date.now() - ReflectivityRadar.lastGcTime) / 1000;
        if (secondsSinceLastGc > 60) {
            ReflectivityRadar.removeOldReports();
            ReflectivityRadar.lastGcTime = Date.now();
        }
        return ReflectivityRadar.mapByReferenceId;
    };
    /**
     * Add or update reflectivity block report to the store.
     * @param report The report to add or update.
     */
    ReflectivityRadar.addReport = function (report) {
        ReflectivityRadar.mapByReferenceId[report.globalBlockReferenceId] = report;
    };
    ReflectivityRadar.removeOldReports = function () {
        var now = Date.now();
        for (var id in ReflectivityRadar.mapByReferenceId) {
            if (ReflectivityRadar.mapByReferenceId.hasOwnProperty(id)) {
                var report = ReflectivityRadar.mapByReferenceId[id];
                var reportAgeSeconds = (now - report.reportTime) / 1000;
                if (reportAgeSeconds > ReflectivityRadar.maxReportAgeSeconds) {
                    delete ReflectivityRadar.mapByReferenceId[id];
                }
            }
        }
    };
    ReflectivityRadar.maxReportAgeSeconds = 15 * 60;
    ReflectivityRadar.mapByReferenceId = {};
    ReflectivityRadar.lastGcTime = 0;
    return ReflectivityRadar;
}());
exports.ReflectivityRadar = ReflectivityRadar;
/**
 * Holds the data for a reflectivity block.
 */
var Reflectivity = /** @class */ (function () {
    /**
     * Build NEXRAD data from an uplink package.
     * @param globalBlockReferenceId The block Id that defines the coverage region.
     * @param boundaries The coordinate boundaries of the coverage region.
     * @param bins The bin data for the coverage blocks.
     */
    function Reflectivity(globalBlockReferenceId, boundaries, bins) {
        // TODO: Use the hour and minute from the message and combine it with the UTC date
        this.reportTime = Date.now();
        this.globalBlockReferenceId = globalBlockReferenceId;
        this.boundaries = boundaries;
        this.reflectivity = [];
        while (bins.length > 0) {
            var row = bins.splice(0, 32);
            this.reflectivity.push(row);
        }
    }
    /**
     * How old is the report?
     * @returns The age of the report in seconds.
     */
    Reflectivity.prototype.getReportAgeSeconds = function () {
        return (Date.now() - this.reportTime) / 1000;
    };
    return Reflectivity;
}());
exports.Reflectivity = Reflectivity;
//# sourceMappingURL=nexrad.js.map