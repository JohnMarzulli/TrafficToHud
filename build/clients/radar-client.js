"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadarClient = void 0;
var logging_object_1 = require("../logging-object");
var socket_client_1 = require("./socket-client");
var KnownTrafficKey = "known_traffic";
var IcaoAddressKey = "Icao_addr";
var ReportReceivedKey = "ReportReceivedAt";
var AgeKey = "Age";
var RadarClient = /** @class */ (function (_super) {
    __extends(RadarClient, _super);
    function RadarClient() {
        var _this = _super.call(this, "RADAR", "radar", logging_object_1.LogLevel.debug) || this;
        _this.TrafficRemovalPeriodSeconds = 60.0;
        return _this;
    }
    RadarClient.prototype.report = function (report) {
        var json = JSON.parse(report);
        if (json == null || json == undefined) {
            json = {};
        }
        if (this.responsePackage == null || this.responsePackage == undefined) {
            this.responsePackage = json;
        }
        if (!this.keyInPackage(this.responsePackage, KnownTrafficKey)) {
            this.responsePackage[KnownTrafficKey] = {};
        }
        if (this.keyInPackage(json, IcaoAddressKey)) {
            var trafficKey = json[IcaoAddressKey];
            json[ReportReceivedKey] = Date.now();
            this.responsePackage[KnownTrafficKey][trafficKey] = json;
        }
        else {
            var merged = __assign(__assign({}, this.responsePackage), json);
            this.responsePackage = merged;
        }
    };
    RadarClient.prototype.handleMessage = function (data) {
        _super.prototype.handleMessage.call(this, data);
        if (!this.keyInPackage(this.responsePackage, KnownTrafficKey)) {
            return;
        }
        var gcedRadar = {};
        for (var key in this.responsePackage[KnownTrafficKey]) {
            var lastReceivedTime = this.responsePackage[KnownTrafficKey][key][ReportReceivedKey];
            var lastReceivedAge = (Date.now() - lastReceivedTime) / 1000.0;
            var stratuxAge = this.responsePackage[KnownTrafficKey][key][AgeKey];
            if (stratuxAge >= this.TrafficRemovalPeriodSeconds || lastReceivedAge >= this.TrafficRemovalPeriodSeconds) {
                this.LogSpew(this.socketName + ": GCed " + key);
            }
            else {
                gcedRadar[key] = this.responsePackage[KnownTrafficKey][key];
            }
        }
        this.responsePackage[KnownTrafficKey] = gcedRadar;
    };
    return RadarClient;
}(socket_client_1.SocketClient));
exports.RadarClient = RadarClient;
//# sourceMappingURL=radar-client.js.map