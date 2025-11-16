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
exports.BasicReport = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var coordinate_1 = require("../types/coordinate");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
/**
 * Store a "Basic Report" (Uplink nomeclature)
 */
var BasicReport = /** @class */ (function (_super) {
    __extends(BasicReport, _super);
    function BasicReport(message) {
        // EX:
        // "recievedAt": 1735669011827,
        // "report": "30,0,0,0,0,164,130,254,67,208,149,82,54,184,6,153,16,52,32,0,40,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,47,224"
        var _this = 
        // Format defined on pg26, https://www.faa.gov/sites/faa.gov/files/air_traffic/technology/adsb/archival/GDL90_Public_ICD_RevA.PDF?form=MG0AV3
        _super.call(this, logging_object_1.LogLevel.all) || this;
        console_1.assert(message.messageType == 30);
        // Basic report
        // Pg 26, FAA
        // UAT?
        var timeOfReception = message.message.subarray(2, 5);
        var payload = message.message.slice(5);
        // The payload is defined in RTCA/DO-282, Section 2.2
        var icaoAddress = payload.slice(0, 3); // 3-byte ICAO address
        var flags = payload[3]; // Flags for type of data
        var latitude = (payload[4] << 16) | (payload[5] << 8) | payload[6]; // Latitude encoding
        var longitude = (payload[7] << 16) | (payload[8] << 8) | payload[9]; // Longitude encoding
        var additionalData = payload.slice(14); // Any remaining data
        _this.location = new coordinate_1.Coordinate(longitude, latitude);
        _this.altitude = (payload[10] << 8) | payload[11]; // Altitude
        _this.speed = (payload[12] << 8) | payload[13]; // Velocity
        _this.LogSpew("UAT BASIC MSG: " + message.message.toString());
        _this.LogSpew("UAT BASIC MSG: TimeReceived=" + timeOfReception + ", ICAO=" + icaoAddress + ", flags=" + flags + ", lat=" + latitude + ", long=" + longitude + ", alt=" + _this.altitude + ", vel=" + _this.speed + ", additional=" + additionalData + ", ");
        return _this;
    }
    return BasicReport;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.BasicReport = BasicReport;
//# sourceMappingURL=basic-report.js.map