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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Traffic = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var Traffic = /** @class */ (function (_super) {
    __extends(Traffic, _super);
    function Traffic(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.error) || this;
        console_1.assert(message.messageType == 20);
        // Uses 3.5.1
        // Pg 17 & 18
        // https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF
        //if (deframedReport.length != 30) {
        //  this.LogError(`TRAFFIC: report.length=${report.length}`);
        //}
        _this.LogSpew("TRAFFIC:" + message.message);
        return _this;
    }
    return Traffic;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.Traffic = Traffic;
//# sourceMappingURL=traffic.js.map