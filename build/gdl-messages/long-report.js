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
exports.LongReport = void 0;
var console_1 = require("console");
var logging_object_1 = require("../logging-object");
var decoded_gdl90_message_1 = require("./decoded-gdl90-message");
var LongReport = /** @class */ (function (_super) {
    __extends(LongReport, _super);
    function LongReport(message) {
        var _this = _super.call(this, logging_object_1.LogLevel.all) || this;
        console_1.assert(message.messageType == 31);
        // Basic report
        // Pg 26, FAA
        // UAT?
        _this.LogSpew("UAT LONG MSG: TimeReceived=" + message.message.subarray(2, 5) + ", Payload=" + message.rawMessage.substring(5, 38));
        return _this;
    }
    return LongReport;
}(decoded_gdl90_message_1.DecodedGdl90Message));
exports.LongReport = LongReport;
//# sourceMappingURL=long-report.js.map