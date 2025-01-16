"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reflectivity = exports.ReflectivityRadar = void 0;
var ReflectivityRadar = /** @class */ (function () {
    function ReflectivityRadar() {
    }
    ReflectivityRadar.getReflectivity = function (req) {
        var secondsSinceLastGc = (Date.now() - ReflectivityRadar.lastGcTime) / 1000;
        if (secondsSinceLastGc > 60) {
            ReflectivityRadar.removeOldReports();
            ReflectivityRadar.lastGcTime = Date.now();
        }
        return ReflectivityRadar.mapByReferenceId;
    };
    ReflectivityRadar.addReport = function (report) {
        ReflectivityRadar.mapByReferenceId[report.globalBlockReferenceId] = report;
    };
    ReflectivityRadar.removeOldReports = function () {
        var now = Date.now();
        for (var id in ReflectivityRadar.mapByReferenceId) {
            if (ReflectivityRadar.mapByReferenceId.hasOwnProperty(id)) {
                var report = ReflectivityRadar.mapByReferenceId[id];
                var reportAgeSeconds = (now - report.reportTime) / 1000;
                if (reportAgeSeconds > ReflectivityRadar.MaxReportAgeSeconds) {
                    delete ReflectivityRadar.mapByReferenceId[id];
                }
            }
        }
    };
    ReflectivityRadar.MaxReportAgeSeconds = 15 * 60;
    ReflectivityRadar.mapByReferenceId = {};
    ReflectivityRadar.lastGcTime = 0;
    return ReflectivityRadar;
}());
exports.ReflectivityRadar = ReflectivityRadar;
var Reflectivity = /** @class */ (function () {
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
    Reflectivity.prototype.getReportAgeSeconds = function () {
        return (Date.now() - this.reportTime) / 1000;
    };
    return Reflectivity;
}());
exports.Reflectivity = Reflectivity;
//# sourceMappingURL=reflectivity.js.map